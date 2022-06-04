const DEFAULT_WAIT_TIME = 3;
const DEFAULT_AUCTION_TIME = 5;
const waitingRoom = "waiting-room";

function LobbyManager(io){
    var LbMg = this;
    // Public Room
    LbMg.lobby = [];
    // LbMg.updating = false;
    
    // Public Room에서 대기 중인  명수
    LbMg.size = function() {
        return LbMg.lobby.length;
    };
    
    // Public Room에 추가
    LbMg.push = function(socket){
        socket.join(waitingRoom);
        LbMg.lobby.push(socket);
        io.in(waitingRoom).emit('wait-number-change', LbMg.size());
    };
    
    // Public Room에서 나오기
    LbMg.kick = function(socket){
        socket.leave(waitingRoom);
        
        // 대기 리스트에서 제거
        var index = LbMg.lobby.indexOf(socket);
        if(index >= 0) LbMg.lobby.splice(index,1);
        io.in(waitingRoom).emit('wait-number-change', LbMg.size());
    };
    
    // Public Room에서 null인 Socket들 정리
    LbMg.clean = function(){
        var sockets = LbMg.lobby;
        LbMg.lobby = sockets.filter(function(socket){ return socket !== null; });
    };
    
    // 6명 이상들어오면 방 생성
    LbMg.dispatch = function(RmMg){
        if(LbMg.dispatching) return;
        LbMg.dispatching = true;
  
        while(LbMg.lobby.length > 5) {
            var players = LbMg.lobby.splice(0,6);
            RmMg.create(players, DEFAULT_WAIT_TIME, DEFAULT_AUCTION_TIME, waitingRoom);
        }
        LbMg.dispatching = false;
    };
    
    // Custom Room
    LbMg.custom_lobby = {};
    LbMg.custom_time_info = {};
    LbMg.custom_user_dict = {};
    
    // Custom Room Id가 이미 존재하는지 확인
    LbMg.isCustomIdNotExist = function(roomId, is_create=false, wait_time=DEFAULT_WAIT_TIME, auction_time=DEFAULT_AUCTION_TIME) {
        // Id가 이미 존재하는 경우
        if(roomId in LbMg.custom_lobby) {
            return null;
        }
        // Id가 없는 경우
        else {
            // 방을 생성하는 상황일 경우
            if(is_create) {
                // 새로운 Custom Room 생성
                LbMg.custom_lobby[roomId] = [];
                
                // Custom Room의 게임 설정 (대기 시간, 경매 시간)
                if(wait_time < 2) {
                    wait_time = DEFAULT_WAIT_TIME;
                }
                if(auction_time < 3) {
                    auction_time = DEFAULT_AUCTION_TIME;
                }
                LbMg.custom_time_info[roomId] = [wait_time, auction_time];
            }
            return roomId;
        }
        // console.log(Object.keys(LbMg.custom_lobby));
    };
    
    // Custom Room에 대기 중인 인원 명수
    LbMg.sizeCustom = function(roomId) {
        if(roomId in LbMg.custom_lobby) {
            return LbMg.custom_lobby[roomId].length;
        }
        return -1;
    };
    
    // Custom Room에 참여
    LbMg.pushCustom = function(socket, roomId) {
        socket.join(roomId);
        
        if(roomId in LbMg.custom_lobby) {
            LbMg.custom_lobby[roomId].push(socket);
            LbMg.custom_user_dict[socket.id] = roomId;
        }
        
        io.to(socket.id).emit('room-id-create-result', true);
        io.in(roomId).emit('wait-number-change-custom', LbMg.sizeCustom(roomId));
        // console.log("Push", Object.keys(LbMg.custom_lobby), Object.keys(LbMg.custom_user_dict));
    };
    
    // Custom Room 방 해체
    LbMg.breakCustom = function(socket) {
        if(socket.id in LbMg.custom_user_dict) {
            var roomId = LbMg.custom_user_dict[socket.id];
            if(roomId in LbMg.custom_lobby) {
                var sockets = LbMg.custom_lobby[roomId];
                sockets.forEach(function(socket) {
                    socket.emit('room-break-during-join');
                    delete LbMg.custom_user_dict[socket.id];
                });
                LbMg.custom_lobby[roomId] = sockets.filter(function(socket){ return socket !== null; });
                delete LbMg.custom_lobby[roomId];
                delete LbMg.custom_time_info[roomId];
            }
        }
        // console.log("Breka", Object.keys(LbMg.custom_lobby), Object.keys(LbMg.custom_user_dict));
    };

    // Custom Room의 대기줄에서 나오기
    LbMg.leaveCustom = function(socket) {
        if(socket.id in LbMg.custom_user_dict) {
            var roomId = LbMg.custom_user_dict[socket.id];
            
            if(roomId in LbMg.custom_lobby) {
                socket.leave(roomId);
                var index = LbMg.custom_lobby[roomId].indexOf(socket);
                if(index >= 0) {
                    LbMg.custom_lobby[roomId].splice(index,1);
                    delete LbMg.custom_user_dict[socket.id];
                    io.in(roomId).emit('wait-number-change-custom', LbMg.sizeCustom(roomId));
                }
            }
        }
        // console.log("Leave", Object.keys(LbMg.custom_lobby), Object.keys(LbMg.custom_user_dict));
    };

    // 6 명 이상 들어오면 방 생성
    LbMg.dispatchCustom = function(RmMg, roomId) {
        if(roomId in LbMg.custom_lobby) {
            while(roomId in LbMg.custom_lobby && LbMg.custom_lobby[roomId].length > 5){
                var players = LbMg.custom_lobby[roomId].splice(0,6);
                var tmp_list = players.map((p) => {
                    return p.id;
                });
                RmMg.create(players, LbMg.custom_time_info[roomId][0], LbMg.custom_time_info[roomId][1], roomId);
          
                tmp_list.forEach(function(user_id) {
                    delete LbMg.custom_user_dict[user_id];
                });
                delete LbMg.custom_lobby[roomId];
                delete LbMg.custom_time_info[roomId];
                // console.log("Dispatch", Object.keys(LbMg.custom_lobby), Object.keys(LbMg.custom_user_dict));
            }
        }
    };
}
  
module.exports = LobbyManager;