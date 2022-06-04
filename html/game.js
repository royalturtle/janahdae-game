$(document).ready(function () {
	// 기본 Socket
    const socket = io.connect("http://localhost:3000/", {
        transports: ['websocket', 'polling']
    });
	
	// 게임 초기화
    function initGame() {
        // 설정 초기화
        wait_timer = null;
        time_wait_remain = 0;
        auction_timer = null;
        time_auction_remain = 0;
        my_team_index = -1;
        is_check_point = false;
        is_auction_start = false;

        // player box 초기화
        who_first = DEFAULT_WHO_FIRST;
        current_selected = 0;
        money = DEFAULT_MONEY;

        // input box 초기화
        clearMoneyInput();

        for (const team_index of Array(6).keys()) {
            // 각팀 경매된 선수들 이미지 및 텍스트 없애기
            for (const position_index of Array(5).keys()) {
                var tmp_position = position_dict[position_index]["name"];
                var newImage = new Image(78, 78);
                newImage.src = position_dict[position_index]["icon"];
                var tmp_str = '#team' + String(team_index) + ' .team_squad > .lineup_' + tmp_position + ' > .selected_player_';
                $(tmp_str + 'image').html(newImage);
                $(tmp_str + 'text .selected_player_text_name').html("&nbsp;");
                $(tmp_str + 'text .selected_player_text_point').html("&nbsp;");
                $(tmp_str + 'text .selected_player_text_point').css("display", "none");
            }

            // 각 팀의 포인트 초기화
            $('.team_info_point').text(max_money);

            // 각 팀의 title bar 초기화
            $('.team_info').css("background-color", color_dict["team-online"]);
        }

        // Player box display 조정
        $('#team_name_at_start').text(".");
        $(".player_box_start").css("display", "flex");
        $(".player_box_ingame").css("display", "none");
        $(".player_box_finished").css("display", "none");
    }

    initGame();

    function clearAuctionInfo() {
        is_auction_start = false;
        $('#info_who').css("color", color_dict["gray-light"]);
        $('#info_money').css("color", color_dict["gray-light"]);
    }

    function confirmAuctionInfo() {
        is_auction_start = false;
        $('#info_who').css("color", color_dict["correct"]);
        $('#info_money').css("color", color_dict["correct"]);
    }

	// 유찰
    function skipAuctionInfo() {
        is_auction_start = false;
        $('#info_who').css("color", color_dict["wrong"]);
        $('#info_money').css("color", color_dict["wrong"]);
        $('#info_who').text("유찰");
    }

    // 버튼 이벤트
    $('#button_start').click(function () {
        socket.emit('waiting');
        $('#SearchModal').css('display', 'block');
    });

    $('#SearchModalClose').click(function () {
        socket.emit('close-wait');
        $('#SearchModal').css('display', 'none');
    });

    $('#button_host').click(function () {
        $('#CreateModal').css('display', 'block');
    });

    $('#CreateModalClose').click(function () {
        $('#CreateModal').css('display', 'none');
    });

    $('#button_enter').click(function () {
        $('#EnterModal').css('display', 'block');
    });

    $('#EnterModalClose').click(function () {
        $('#EnterModal').css('display', 'none');
    });

    // 결과 관련 버튼
    $('#action_view_point').click(function () {
        if (is_check_point) {
            is_check_point = false;
            $('.selected_player_text_point').css('display', 'none');
        } else {
            is_check_point = true;
            $('.selected_player_text_point').css('display', 'block');
        }
    });

	// Public 방 참가를 취소했을 경우
    $('#action_close').click(function () {
        initGame();
        $('#ingame_container').css('display', 'none');
        $('#lobby_container').css('display', 'block');
        socket.emit('close-game');
    });

    // 경매 게임 시작 알림을 받은 경우
    socket.on('game-start', function (data) {
        initGame();
        my_team_index = data;
        $('#team_name_at_start').text(manager_list[my_team_index]);
        $('#team' + String(data) + ' .team_info').css('background', color_dict["team-my"]);
        is_game_start = true;
    });

	// 경매 게임 시작
    socket.on('auction-game-start', function (data) {
        $('.player_box_start').css('display', 'none');
        $('.player_box_ingame').css('display', 'flex');
    });

	// 경매 게임 방으로 들어온 경우
    socket.on('enter-game', function (data) {
        if (is_create_room) {
            is_create_room = false;
            stopCreateCustomSignal();
        } else if (is_join_room) {
            is_join_room = false;
            stopJoinCustomSignal();
        }

        $('#SearchModal').css('display', 'none');
        $('#CreateModal').css('display', 'none');
        $('#EnterModal').css('display', 'none');
        $('#lobby_container').css('display', 'none');
        $('#ingame_container').css('display', 'flex');
        time_auction_countdown = data.auction;
        time_wait_countdown = data.wait;
        socket.emit('ready-next');
    });

    // 경매 게임 종료 이벤트를 받은 경우
    socket.on('game-finished', function (data) {
        $('#player_img_' + String(current_selected)).css('display', 'none');
        current_selected = 0;
        $('#player_img_' + String(current_selected)).css('display', 'block');
        is_game_start = false;

        // player box display 조정
        $(".player_box_ingame").css("display", "none");
        $(".player_box_finished").css("display", "flex");
    });

	// Public 방의 참가 인원의 변화 알람을 받은 경우
    socket.on('wait-number-change', function (data) {
        $('#CurrentWaitingText').text(String(data));
    });

    // 오프라인 이벤트
    socket.on('player-offlined', function (data) {
        $('#team' + String(data) + ' .team_info').css('background', color_dict["team-offline"]);
    });

    // Custom 방 생성의 성공 여부를 서버에서부터 전달받은 경우
    socket.on('room-id-create-result', function (data) {
        if (data) {
            is_create_room = true;
            $('#create_room_id').css("background", color_dict["white"]);

            // Button disable
            $('#create_room_close').css('background', color_dict["gray-dark"]);
            $('#create_room_do').text("중단하기");
            $('#create_room_id').attr('disabled', true);
            $('#create_room_wait_time').attr('disabled', true);
            $('#create_room_auction_time').attr('disabled', true);
            $('#create_room_close').attr('disabled', true);
        } else {
            $('#create_room_id').val("")
            $('#create_room_id').attr("placeholder", "이미 존재하는 방 ID 입니다.");
            $('#create_room_id').css("background", color_dict["wrong"]);
        }
    });

	// 현재 Custom 방의 참가 인원이 변경될 경우
    socket.on('wait-number-change-custom', function (data) {
        $('#custom_joined_text_create').text(data);
        $('#custom_joined_text_join').text(data);
    });

	// Custom 방 생성 중이다가 취소 할 경우
    function stopCreateCustomSignal() {
        socket.emit('break-custom');
        is_create_room = false;
        $('#custom_joined_text_create').text(0);
        $('#custom_joined_text_join').text(0);
        $('#create_room_id').attr('disabled', false);
        $('#create_room_wait_time').attr('disabled', false);
        $('#create_room_auction_time').attr('disabled', false);
        $('#create_room_do').text("생성");
        $('#create_room_close').attr('disabled', false);
        $('#create_room_close').css('background', color_dict["button"]);
    }

	// Custom 방 생성 버튼을 눌렀을 경우
    $('#create_room_do').click(function () {
        if (!is_create_room) {
            var room_id = $('#create_room_id').val();
            var wTime = $('#create_room_wait_time').val();
            var aTime = $('#create_room_auction_time').val();
            socket.emit('create-custom', {
                roomId: room_id,
                waitTime: wTime,
                auctionTime: aTime
            });
        } else {
            stopCreateCustomSignal();
        }
    });

	// Custom 방 생성 Dialog를 닫음
    $('#create_room_close').click(function () {
        if (is_create_room) {
            stopCreateCustomSignal();
        }
        $('#CreateModal').css('display', 'none');
    });

    function stopJoinCustomSignal() {
        socket.emit('leave-custom');
        is_join_room = false;
        $('#custom_joined_text_create').text(0);
        $('#custom_joined_text_join').text(0);
        $('#join_room_id').attr('disabled', false);
        $('#join_room_do').text("참가");
        $('#join_room_close').attr('disabled', false);
        $('#join_room_close').css('background', color_dict["button"]);
    }

    // Custom 방 참가 신호를 서버에 전송
    $('#join_room_do').click(function (data) {
        if (!is_join_room) {
            var room_id = $('#join_room_id').val();
            socket.emit('join-custom', room_id);
        } else {
            stopJoinCustomSignal();
        }
    });

	// Custom 방에 참가 성공 여부를 받은 경우
    socket.on('room-id-join-result', function (data) {
        if (data) {
            is_join_room = true;
            $('#join_room_id').css("background", color_dict["white"]);

            // Button disable
            $('#join_room_close').css('background', color_dict["gray-dark"]);
            $('#join_room_do').text("중단하기");
            $('#join_room_id').attr('disabled', true);
            $('#join_room_close').attr('disabled', true);
        } else {
            $('#join_room_id').val("")
            $('#join_room_id').attr("placeholder", "존재하지 않은 방 ID 입니다.");
            $('#join_room_id').css("background", color_dict["wrong"]);
        }
    });

	// Custom 방 참가 중에 방이 사라졌다는 알람을 받은 경우
    socket.on('room-break-during-join', function () {
        stopJoinCustomSignal();
    });

	// Custom 방 참가 Dialog를 Close
    $('#join_room_close').click(function (data) {
        if (!is_join_room) {
            stopJoinCustomSignal();
        }
        $('#EnterModal').css('display', 'none');
    });
    // 여기까지 커스텀

	// 새로운 경매 매물이 나왔을 경우
    socket.on('new-lineup', function (data) {
        $('#player_img_' + String(current_selected)).css('display', 'none');
        $('#player_img_' + String(data)).css('display', 'block');

        $('#player_name').text(player_list[data]["name"]);
        $('#tier_name').text(tier_list[player_list[data]["tier-type"]]["name"] + " " + player_list[data]["tier-number"]);

        $('#tier_icon_' + tier_list[player_list[current_selected]["tier-type"]]["name"]).css('display', 'none');
        $('#tier_icon_' + tier_list[player_list[data]["tier-type"]]["name"]).css('display', 'block');

        $('#position_icon_' + position_dict[player_list[current_selected]["position"]]["name"]).css('display', 'none');
        $('#position_icon_' + position_dict[player_list[data]["position"]]["name"]).css('display', 'block');

        current_selected = data;

        who_first = DEFAULT_WHO_FIRST;
        money = DEFAULT_MONEY;
        clearAuctionInfo();
        clearMoneyInput();
        initWaitTimer();
    });

	// 경매 시작 알림을 받은 경우
    socket.on('auction-start', function (data) {
        clearInterval(wait_timer);
        is_auction_start = true;
        $('#info_who').text("경매 중");
        $('#info_money').text("");
        initAuctionTimer();
    });

    socket.on('skip-auction', function () {
        skipAuctionInfo();
    });

	// 입찰가 변동
    socket.on('money-changed', function (data) {
		// 타이머 초기화
        initAuctionTimer();
		
		// 변동 적용
        money = data.money;
        who_first = data.who;
		
		// 변동 UI 적용 (입찰 정보)
        $('#info_who').text(manager_list[who_first]);
        $('#info_money').text(String(money));
		
		// 변동 UI 적용 (타이머)
        $('#info_timer').text(String(time_auction_countdown) + " 초");
        $('#progressBar').val(0);
    });

	// 매물이 입찰되었을 경우
    socket.on('get-person', function (data) {
        var who_get = data.who;
        var what_get = data.person;
        var about_money = data.money;
        var isZero = data.isZero;

        var whats_position = position_dict[player_list[what_get]["position"]]["name"];
        var whats_name = player_list[what_get]["name"]

        confirmAuctionInfo();

        // 돈의 변화를 표시
        $('#team' + who_get + ' .team_info > .team_info_point').text(String(about_money));

        var player_text = '#team' + who_get + ' .team_squad > .lineup_' + whats_position + ' > .selected_player_text .selected_player_text_';
        // 특정 팀에 선수가 들어감을 표시
        $(player_text + 'name').text(whats_name);

        if (isZero) {
            $(player_text + 'point').text(String(0));
        } else {
            $(player_text + 'point').text(String(money));
        }

        // 영입 된 선수의 이미지를 표시
        $('#team' + who_get + ' .team_squad > .lineup_' + whats_position + ' > .selected_player_image').html(player_small_icon_list[what_get]);
    });

	// 입찰 버튼 클릭
    $('#action_enter_button').click(function () {
		submitMoney($('#action_enter').val());
    });

	// text input 칸이 focus 된 상태에서 키보드 입력
    $('#action_enter').keyup(function (e) {
        // Enter를 눌렀을때
        if (e.which === 13 && isNumber(e.target.value)) {
            submitMoney(e.target.value);
        }
        // ESC를 눌렀을때
        else if (e.keyCode === 27) {
            clearMoneyInput();
        }
    });
	
	// 돈 입찰
	function submitMoney(input) {
        if (is_game_start) {
            socket.emit('money-change', input);
        }
        clearMoneyInput();
        validateMoney(input);
	}

	// text input 칸을 초기화
    function clearMoneyInput() {
        $('#action_enter').val('');
        $('#action_enter').attr('placeholder', "포인트 (단위 5)[Enter나 '입찰' 버튼]");
        $('#action_enter').css('background-color', color_dict["white"]);
    }

	// 현재 최고 입찰가에 +5 가격을 입찰
    $('#action_check').click(function () {
		var newMoney = money + min_up_money;
        socket.emit('money_change', newMoney);
        validateMoney(newMoney);
    });

	// 입찰가가 유효한 값인지 확인
    function validateMoney(value) {
        var positionsName = $('#team' + String(my_team_index) + " .team_squad .lineup_" + position_dict[player_list[current_selected]["position"]]["name"] + " .selected_player_text .selected_player_text_name").html();
		
        if (!is_auction_start) {
            $('#action_enter').attr('placeholder', '아직 경매가 시작되지 않았습니다.');
            $('#action_enter').css('background-color', color_dict["warning"]);
        } else if (money > value) {
            $('#action_enter').attr('placeholder', '현재 경매가 보다 가격이 낮습니다.');
            $('#action_enter').css('background-color', color_dict["warning"]);
        } else if (positionsName !== "&nbsp;") {
            $('#action_enter').attr('placeholder', '이미 가지고 있는 포지션입니다.');
            $('#action_enter').css('background-color', color_dict["warning"]);
        } else if (value > Number($('#team' + String(my_team_index) + " .team_info .team_info_point").text())) {
            $('#action_enter').attr('placeholder', '보유한 포인트가 부족합니다.');
            $('#action_enter').css('background-color', color_dict["warning"]);
        } else if (who_first == my_team_index) {
            $('#action_enter').attr('placeholder', '이미 입찰자로 등록되어 있습니다.');
            $('#action_enter').css('background-color', color_dict["warning"]);
        } else if (value <= 0 || value > max_money) {
            $('#action_enter').attr('placeholder', '5에서 1000까지의 정수를 입력해주세요.');
            $('#action_enter').css('background-color', color_dict["warning"]);
        }
    }

	// 경매 대기 시간 초기화
	function initWaitTimer() {
        clearInterval(wait_timer);
        clearInterval(auction_timer);
		
        $('#progressBar').attr("max", time_wait_countdown);
        time_wait_remain = time_wait_countdown;
        wait_timer = setInterval(function () {
            if (time_wait_remain <= 0) {
                clearInterval(wait_timer);
            }
            $('#progressBar').val(time_wait_countdown - time_wait_remain);
            $('#info_who').text("경매 ");
            $('#info_money').text(String(time_wait_remain) + "초 전");
            $('#info_timer').text(".");
            time_wait_remain -= 1;
        }, 1000);
    }

	// 경매 시간 초기화
	function initAuctionTimer() {
        clearInterval(auction_timer);
        clearInterval(wait_timer);

        $('#action_check').attr('disabled', true);
        $('#action_check').css('background-color', color_dict["team-offline"]);
        setTimeout(function () {
            $('#action_check').attr('disabled', false);
            $('#action_check').css('background-color', color_dict["button"]);
        }, 1500);

        $('#progressBar').attr("max", time_auction_countdown);
        time_auction_remain = time_auction_countdown;
        auction_timer = setInterval(function () {
            if (time_auction_remain <= 0) {
                clearInterval(auction_timer);
            }
            $('#progressBar').val(time_auction_countdown - time_auction_remain);
            $('#info_timer').text(String(time_auction_remain) + " 초");
            time_auction_remain -= 1;
        }, 1000);
    }
});
