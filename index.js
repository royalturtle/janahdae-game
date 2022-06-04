var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server, {
    serverClient:false,
    origins:'*.*',
    transports:['websocket', 'polling'],
    cookie:false
});

var path = require('path');
app.use("/", express.static(path.join(__dirname, "html")));

// 서버실행
server.listen(3000, function(){
    console.log('Server Running');
});
  
// Game Objects
var lobbyManager = new (require('./game/LobbyManager.js'))(io);
var roomManager = new (require('./game/RoomManager.js'))(io);

// 소켓서버 이벤트 연결
io.on('connection', function(socket){
    console.log("ENTER : ", socket.id);
	
    // Public Room (Enter)
    socket.on('waiting', function(){
        lobbyManager.push(socket);
        lobbyManager.dispatch(roomManager);
        console.log('waiting ', socket.id);
    });

    // Public Room (Close)
    socket.on('close-wait', function(){
        lobbyManager.kick(socket);
        console.log('close-wait ', socket.id);
    });

    // Custom Room (Create)
    socket.on('create-custom', function(data) {
	// 게임 정보 (방 ID, 대기 시간, 경매 시간)
        var roomId = data.roomId;
        var waitTime = parseInt(data.waitTime);
        var auctionTime = parseInt(data.auctionTime);
	    
        if(roomId === null || waitTime === null || auctionTime === null) { return; }

	// 이미 존재하는 방 ID인지 확인
        var isKeyNotExist = lobbyManager.isCustomIdNotExist(roomId, true, waitTime, auctionTime);
	// 방 생성 실패시
        if(isKeyNotExist == null || roomId === "")  {
            io.to(socket.id).emit('room-id-create-result', false);
        } 
	// 방 생성 성공시
	else {
	    // 방 참가 및 알리기
            lobbyManager.pushCustom(socket, roomId);
            
	    // 게임 시작 여부 확인
            lobbyManager.dispatchCustom(roomManager, roomId);
            console.log('custom-create ', roomId);
        }
    });
	
    // Custom Room (Break)
    socket.on('break-custom', function() {
        lobbyManager.breakCustom(socket);
    });
	
    // Custom Room (Join)
    socket.on('join-custom', function(roomId) {
        var isKeyNotExist = lobbyManager.isCustomIdNotExist(roomId,false);
        if(isKeyNotExist != null || roomId === "")  {
            io.to(socket.id).emit('room-id-join-result', false);
        } else {
	    // 방 참가 및 알리기
            lobbyManager.pushCustom(socket, roomId);
		
            // 게임 시작 여부 확인
            lobbyManager.dispatchCustom(roomManager, roomId);
            console.log('custom-join ', socket.id, roomId);
        }
    });
	
    // Custom Room (Leave)
    socket.on('leave-custom', function() {
        lobbyManager.leaveCustom(socket);
    });

    // In Game (Status Changed)
    socket.on('ready-next', function() {
        var roomIndex = roomManager.roomIndex[socket.id];
        roomManager.readyNextLineup(roomIndex, socket.id);
        console.log('ready-next ', socket.id);
    });

    // In Game (Submit Money)
    socket.on('money-change', function(money) {
        var roomIndex = roomManager.roomIndex[socket.id];
        roomManager.moneyChanged(roomIndex, socket.id, money);
        // console.log('money-change ', socket.id);
    });
	
    // In Game (Close Current Game)
    socket.on('close-game', function() {
        var roomIndex = roomManager.roomIndex[socket.id];
        if(roomIndex != null) {
            roomManager.PlayerOfflined(roomIndex, socket.id);
        }
        console.log('close-game ', socket.id);
    });
	
    // In Game (Disconnected)
    socket.on('disconnect', function() {
        var roomIndex = roomManager.roomIndex[socket.id];
        if(roomIndex != null) {
            roomManager.PlayerOfflined(roomIndex, socket.id);
        }
        lobbyManager.kick(socket);
        lobbyManager.leaveCustom(socket);
        console.log('disconnect ', socket.id);
    });
});