var Player = require("./Player.js");

function RoomManager(io){
    var RmMg = this;
    RmMg.rooms = {};
    RmMg.roomIndex = {};
  
    // [Create, Destroy]
    RmMg.create = function(sockets, wait_time, auction_time, waitingRoom){
        var roomId;
        sockets.forEach(function(socket){
            roomId += socket.id;
        });
        
        var room = new Room(RmMg,roomId,sockets, wait_time, auction_time);
        
        sockets.forEach(function(socket){
            socket.leave(waitingRoom);
            socket.join(roomId);
        });
        
        sockets.forEach(function(socket){
            socket.emit("enter-game", {wait: wait_time, auction: auction_time});
            RmMg.roomIndex[socket.id] = roomId;
        });
        
        RmMg.rooms[roomId] = room;
        console.log("Room Created :", roomId);
    };

    RmMg.destroy = function(roomId){
        var room = RmMg.rooms[roomId];
        if(room != null) {
            room.players_socket.forEach(function(socket) {
                io.to(socket.id).emit('destroy');
            });
            delete RmMg.rooms[roomId];
            console.log("room destroyed : ", roomId);
        }
    };

    // [External Methods]
    // 새로운 매물이 나왔을 경우
    RmMg.readyNextLineup = function(roomId, socketId) {
        var room = RmMg.rooms[roomId];
        if(room != null) {
            room.readyNextLineup(socketId);
        }
    }

    // 새로 입찰이 들어온 경우
    RmMg.moneyChanged = function(roomId, socketId, money) {
        var room = RmMg.rooms[roomId];
        if(room != null) {
            room.changeMoney(socketId, money);
        }
    }

    // User들 중에 나간 사람이 있을 
    RmMg.PlayerOfflined = function(roomId, socketId) {
        var room = RmMg.rooms[roomId];
        if(room != null) {
            room.PlayerOfflined(socketId);
        }
    }

    // [Internal Methods]
    // 경매장으로 입장할 경우 알림
    RmMg.emitGameStart = function(socketId, person_index) {
        io.to(socketId).emit('game-start', person_index);
    }

    // 첫 경매 매물이 나왔을 경우 알림
    RmMg.emitAuctionGameStart = function(socketID) {
        io.to(socketID).emit('auction-game-start');
    }

    // 새로운 매물이 나왔을 경우 알림
    RmMg.emitNewPlayer = function(socketID, value) {
        io.to(socketID).emit('new-lineup', value);
    }
    
    // 경매 입찰이 시작되었을 경우 알림
    RmMg.emitAuctionStart = function(socketID) {
        io.to(socketID).emit('auction-start');
    }

    // 최고 경매가가 변경되었을 경우 알림
    RmMg.emitMoneyChanged = function(socketID, byWho, aboutMoney) {
        io.to(socketID).emit('money-changed', { who: byWho, money: aboutMoney});
    }

    // 매물이 입찰 완료되었을 경우 알림
    RmMg.emitGetPerson = function(socketID, byWho, personID, aboutMoney, is_zero) {
        io.to(socketID).emit('get-person', {who: byWho, person: personID, money: aboutMoney, isZero : is_zero});
    }

    // 매믈이 유찰 되었을 경우 
    RmMg.emitSkipAuction = function(socketID) {
        io.to(socketID).emit('skip-auction');
    }

    // Off-line된 User가 있을 경우 알림
    RmMg.emitPlayerOffline = function(socketID, off_index) {
        io.to(socketID).emit('player-offlined', off_index);
    }

    // 경매가 모두 마무리되었을 경우 알림
    RmMg.emitGameFinished = function(socketID) {
        io.to(socketID).emit('game-finished');
    }

}
  
module.exports = RoomManager;

// 선수 정보
// Position { 0 : Top, 1 : Jungle, 2 : Mid, 3 : AD, 4 : Supporter }
// Price : 자동 경매에서의 최대치 ( price * 70 )
const player_info_dict = [
    {position:0, price:0},
    
    {position:0, price:4},
    {position:0, price:4},
    {position:0, price:2},
    {position:0, price:4},
    {position:0, price:0},
    {position:0, price:2},
    
    {position:1, price:0},
    {position:1, price:5},
    {position:1, price:5},
    {position:1, price:1},
    {position:1, price:2},
    {position:1, price:1},
    
    {position:2, price:0},
    {position:2, price:5},
    {position:2, price:3},
    {position:2, price:3},
    {position:2, price:5},
    {position:2, price:6},
    
    {position:3, price:0},
    {position:3, price:1},
    {position:3, price:2},
    {position:3, price:3},
    {position:3, price:1},
    {position:3, price:2},
    
    {position:4, price:4},
    {position:4, price:0},
    {position:4, price:2},
    {position:4, price:1},
    {position:4, price:2},
    {position:4, price:1}
];

function Room(manager, id, sockets, wait_time, auction_time) {
    var room = this;
    room.id = id;
    room.manager = manager;

    room.players = sockets.map((s) => {
        return new Player(s.id);
    });

    room.players_socket = sockets;
    room.players_id = sockets.map((s) => {
        return s.id;
    });
    room.ready = [false, false, false, false, false, false];
    
    // Offline된 User
    room.offline_list = [];
    room.offline_actor = null;
    room.is_offline_actor_act = true;
    
    // 경매 시작 여부
    room.is_auction_start = false;
    
    room.ready_num = 0;
    
    // 현재 매물 정보
    room.who = -1;
    room.position = -1;
    room.lineup_id = -1;
    room.money = 0;
    
    // 경매 순서
    room.lineup_index = shuffle(Array.from({length: 30}, (x, i) => i+1));
    // 각 라인별 남아있는 매물
    room.remain_lineup = [
        [1, 2, 3, 4, 5, 6],
        [7, 8, 9, 10, 11, 12],
        [13, 14, 15, 16, 17, 18],
        [19, 20, 21, 22, 23, 24],
        [25, 26, 27, 28, 29, 30]
    ]
    
    // 현재 Index
    room.current_index = 0;
    
    // timer 함수
    room.timer = null;

    // 경매 시작 대기 시간
    room.time_wait_countdown = (wait_time+1) * 1000;
    // 경매 시간
    room.time_auction_countdown = (auction_time+1) * 1000;

    // Socket의 Index 구하기
    room.getIndexOfSocketID = function(socketID) {
        return room.players_id.indexOf(socketID);
    }

    room.readyNextLineup = function(socketId) {
        if(room.ready[room.getIndexOfSocketID(socketId)] == false) {
            room.ready_num += 1;
            room.ready[room.getIndexOfSocketID(socketId)] = true;
        }

        // 체크된 숫자가 6보다 적으면
        if (room.ready_num < 6) {
            var isContinue = false;
        } else {
            var isContinue = true;
            room.ready_num = 0;
        }
      
        if(isContinue) {
            var person_index = 0;
            room.players_id.forEach(function(socketID) {
                room.manager.emitGameStart(socketID, person_index);
                person_index += 1;
            });

            setTimeout(function() {
                room.players_id.forEach(function(socketID) {
                    room.manager.emitAuctionGameStart(socketID);
                });
                room.nextLineup();
            }, 5000);
        }
    }

    room.nextLineup = function() {
        // 모든 선수 경매를 마칠 때 까지
        if(room.current_index < room.lineup_index.length) {
            // player가 0원 밖에 없을 경우 자동 지정
            // 일단 돈 없고, 매물 자리 남은 player 목록
            var unable_players = [];
            room.players.some(function(player) {
                if(player.empty_space > 0) {
                    if(player.money <= 0) {
                        unable_players.push(player);
                    } else {
                        unable_players.length=0;
                        return true;
                    }
                } 
            });

            // unable_players 의 길이가 1보다 크면 자동 입찰
            if(unable_players.length > 1) {
                while(room.current_index < room.lineup_index.length) {
                    room.lineup_id =  room.lineup_index[room.current_index];
                    room.position = player_info_dict[room.lineup_id].position;

                    room.players.some(function(player, index) {
                        if(player.lineup_list[room.position] == -1) {
                            player.lineup_list[room.position] = room.lineup_id;
                            player.empty_space -= 1;

                            room.players_socket.forEach(function(socket){
                                room.manager.emitGetPerson(socket.id, index, room.lineup_id, room.players[index].money, true);
                            });
                            return true;
                        }
                    });
                    room.current_index += 1;
                }
                room.finishGame();
            } else {
                room.lineup_id =  room.lineup_index[room.current_index];
                room.position = player_info_dict[room.lineup_id].position;
                
                // 모든 참가자들에게 새로운 경매 선수가 뜬 것을 알림
                room.players_socket.forEach(function(socket){
                    // 뒤에 parameter는 random하게 섞인 선수 id 리스트의 현재 index 값을 반환
                    room.manager.emitNewPlayer(socket.id, room.lineup_id);
                });
  
                // 일정 시간 후 경매 시작
                setTimeout(function() {
                    room.StartAuction();
                }, room.time_wait_countdown);
            }
        } 
        // 남은 매물이 
        else {
            room.finishGame();
        }
    }

    // 경매 시작
    room.StartAuction = function() {
        // 경매 시작
        room.is_auction_start = true;
        // 신호를 User들에게 알림
        room.players_socket.forEach(function(socket) {
            room.manager.emitAuctionStart(socket.id);
        });
        // 경매 시간을 초기화
        room.initAuctionTimer();

        // 중간에 나간 User가 있는 경우
        if(room.offline_list.length > 0) {
            // 매물이 유찰 매물이 아닌 경우
            if(player_info_dict[room.lineup_id].price > 0) {
                // 자동 입찰 해야 하는 팀 찾기
                var select_index = -1, empty_max = -1;
                // 해당 선수의 포지션이 비어있고, 비어있는 선수가 제일 많은 경우 선택
                room.offline_list.forEach(function(offline_index) {
                    if((room.players[offline_index].lineup_list[room.position] == -1) && (room.players[offline_index].empty_space > empty_max)) {
                        empty_max = room.players[offline_index].empty_space;
                        select_index = offline_index;
                    }
                });
                
                // 자동 입찰 해야 하는 팀이 있을 경우
                if (select_index != -1) {
                    room.offline_actor = select_index;
                    // 2 초후에 5 포인트로 입찰
                    setTimeout(function() {
                        room.changeMoney(room.players_id[room.offline_actor], 5); 
                    }, 2000);
                }
            }
        }
    }

    // 경매 초기화
    room.initAuctionTimer = function() {
        room.who = -1;
        room.money = 0;
        room.restartTimer();
    }

    // 경매 시간 초기화
    room.restartTimer = function() {
        room.stopTimer();
        room.startTimer();
    }

    room.startTimer = function() {
        room.timer = setTimeout(function() {
            room.finishTimer();
        },room.time_auction_countdown);
    }

    room.stopTimer = function() {
        clearTimeout(room.timer);
    }

    // 경매 시간이 끝났을 경우
    room.finishTimer = function() {
        room.is_auction_start = false;

        room.offline_actor = null;
        room.is_offline_actor_act = true;

        // 입찰자가 존재하는 경우
        if(room.who != -1 && room.money > 0) {
            // 최종 입찰자 및 가격 적용
            room.players[room.who].money -= room.money;
            room.players[room.who].lineup_list[room.position] = room.lineup_id;
            room.players[room.who].empty_space -= 1;

            // 남아있는 리스트에서 삭제
            room.remain_lineup[room.position] = remove_from_list(room.remain_lineup[room.position] ,room.lineup_id);

            // 현재 매물의 포지션에서 남은 매물이 한 명 밖에 없으면 자동 배정
            if(room.remain_lineup[room.position].length == 1) {
                // 해당 매물을 찾아서 리스트에서 
                var remain_index = room.remain_lineup[room.position][0]
                room.remain_lineup[room.position] = remove_from_list(room.remain_lineup[room.position], remain_index);
                room.lineup_index = remove_from_list(room.lineup_index, remain_index, room.current_index);
          
                room.players.some(function(player, index) {
                    // 해당 포지션에 비어있는 팀 찾기
                    if(player.lineup_list[room.position] == -1) {
                        // 해당 팀에 대한 정보 업데이트
                        player.lineup_list[room.position] = remain_index;
                        player.empty_space -= 1;

                        // 업데이트 정보를 User들에게 알림
                        room.players_socket.forEach(function(socket){
                            room.manager.emitGetPerson(socket.id, index, remain_index, room.players[index].money, true);
                        });
                        return true;
                    }
                });
            }

            // 보유 중인 돈과 라인업이 달라짐을 User들에게 알림
            room.players_socket.forEach(function(socket){
                room.manager.emitGetPerson(socket.id, room.who, room.lineup_id, room.players[room.who].money, false);
            });
        } 
        // 입찰자가 없는 경우
        else {
            // 유찰된 매물을 경매 매물 리슽트 제일 뒤 쪽에 추가
            room.lineup_index.push(room.lineup_id);
            
            // 유찰되었음을 User들에게 알림
            room.players_socket.forEach(function(socket){
                room.manager.emitSkipAuction(socket.id);
            });
        }
      
        room.current_index += 1;

        // 2초후에 다음 매물로 넘어감
        setTimeout(function() {
            room.nextLineup();
        }, 2000);
    }

    // 새로운 입찰이 들어온 경우
    room.changeMoney = function(socketId, money) {
        money -= (money % 5);
        
        // 입찰자의 index
        index_of_who = room.getIndexOfSocketID(socketId);
        
        // 경매가 시작되지 않은 경우
        if(!room.is_auction_start) { return; } 
        // 입력된 숫자가 숫자가 아니거나 0 이하일 경우
        else if(money <= 0 || !Number.isInteger(money)) { return; } 
        // 이미 입찰자로 등록된 경우
        else if(index_of_who == room.who) { return; } 
        // 이미 입찰된 가격보다 낮은 경우
        else if(money <= room.money) { return; }
        // 보유 돈보다 많은 숫자를 입력했을 경우
        else if(money > room.players[index_of_who].money) { return; }
        // 이미 보유한 포지션인 경우
        else if(room.players[index_of_who].lineup_list[room.position] != -1) { return; }
        else {
            // 새로운 입찰된 돈과 사람을 업데이트
            room.who = index_of_who;
            room.money = money;

            // Timer를 Reset
            room.restartTimer();
            // Room에 있는 다른 Player들에게 내용을 전달
            room.players_socket.forEach(function(socket){
                room.manager.emitMoneyChanged(socket.id, room.who, room.money);
            });

            // 입찰 정보가 새로 업데이트 되고 난 후, Offline 된 팀에서 새로운 입찰 확인
            if(room.offline_actor != null && room.is_offline_actor_act && index_of_who != room.offline_actor) {
                // 아직 입찰 가격이 매물의 예상치보다 높지 않고, 충분한 돈을 가지고 있는 경우
                if(room.money + 5 <= room.players[room.offline_actor].money && room.money < player_info_dict[room.lineup_id].price * 70) {
                    var m = room.money;
                    setTimeout(function() {
                        room.changeMoney(room.players_id[room.offline_actor], m + 5);
                    }, 2000);
                } 
                else {
                  room.is_offline_actor_act = false;
                }
            }
        }
    }
    
    // User가 나간 경우
    room.PlayerOfflined = function(socketId) {
        // 나간 User의 index 구하기
        var offline_index = room.getIndexOfSocketID(socketId);
        
        // Offline된 User의 Index를 추가
        room.offline_list.push(offline_index);
        
        // 해당 내용을 다른 User들에게 알림
        room.players_socket.forEach(function(socket){
            room.manager.emitPlayerOffline(socket.id, offline_index);
        });

        // 6명 이상 나간 경우 방을 해체
        if(room.offline_list.length >= 6) {
            room.manager.destroy(room.id);
        }
    }

    // 경매가 완료될 경우 종료 신호를 모두에게 알림
    room.finishGame = function() {
        room.players_socket.forEach(function(socket){
            room.manager.emitGameFinished(socket.id);
        });
    }    
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function remove_from_list(array, value, from_index=0) {
    const idx = array.indexOf(value, from_index);
    if (idx > -1) {
        array.splice(idx, 1);
    }
    return array;
}