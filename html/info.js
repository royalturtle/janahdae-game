const player_list = [
	{"name":"", "tier-type":1, "tier-number":1, "position":0, "icon-small":"", "icon-big":""},
	
	{"name":"강소연", "tier-type":5, "tier-number":4, "position":0, "icon-small":image_server + "2mxHrhPS1u", "icon-big":image_server + "1SRuHBlVq4"},
	{"name":"룩삼", "tier-type":5, "tier-number":4, "position":0, "icon-small":image_server + "2SKRT5QqVq", "icon-big":image_server + "2SKRT1huSG"},
	{"name":"중력", "tier-type":4, "tier-number":2, "position":0, "icon-small":image_server + "1SRuHFUn4q", "icon-big":image_server + "37a8GFfa8O"},
	{"name":"얍얍", "tier-type":5, "tier-number":4, "position":0, "icon-small":image_server + "0SZN5PYn2s", "icon-big":image_server + "0SZN5LprDX"},
	{"name":"해기님", "tier-type":4, "tier-number":3, "position":0, "icon-small":image_server + "27hb4TSZAi", "icon-big":image_server + "0SZN5Lq22J"},
	{"name":"이선생", "tier-type":4, "tier-number":3, "position":0, "icon-small":image_server + "0nCDU1XkkG", "icon-big":image_server + "1n4kfnlDcO"},
	
	{"name":"쌍베", "tier-type":3, "tier-number":3, "position":1, "icon-small":image_server + "0nCDU1XrnC", "icon-big":image_server + "27hb4Pk55S"},
	{"name":"스나랑", "tier-type":4, "tier-number":4, "position":1, "icon-small":image_server + "17p3sdWj8G", "icon-big":image_server + "2SKRT1j8TC"},
	{"name":"삼식", "tier-type":4, "tier-number":1, "position":1, "icon-small":image_server + "37a8GJPEJu", "icon-big":image_server + "2mxHrdhzLm"},
	{"name":"배돈", "tier-type":4, "tier-number":1, "position":1, "icon-small":image_server + "0nCDU1YEFo", "icon-big":image_server + "2mxHrdi8l8"},
	{"name":"남봉", "tier-type":4, "tier-number":3, "position":1, "icon-small":image_server + "1SRuHFVoz4", "icon-big":image_server + "1SRuHBnL3a"},
	{"name":"푸린", "tier-type":4, "tier-number":4, "position":1, "icon-small":image_server + "2mxHrhQsW8", "icon-big":image_server + "17p3sZokRs"},
	
	{"name":"정예지", "tier-type":5, "tier-number":4, "position":2, "icon-small":image_server + "2SKRT5SLom", "icon-big":image_server + "1SRuHBngR8"},
	{"name":"악어", "tier-type":5, "tier-number":3, "position":2, "icon-small":image_server + "0nCDU1Yryy", "icon-big":image_server + "1n4kfnmYsC"},
	{"name":"도현", "tier-type":5, "tier-number":4, "position":2, "icon-small":image_server + "1n4kfrVBlq", "icon-big":image_server + "2mxHrdix60"},
	{"name":"류제홍", "tier-type":5, "tier-number":4, "position":2, "icon-small":image_server + "27hb4TU2o8", "icon-big":image_server + "37a8GFhrBO"},
	{"name":"눈꽃", "tier-type":5, "tier-number":4, "position":2, "icon-small":image_server + "0SZN5PaVKU", "icon-big":image_server + "0nCDTxqroO"},
	{"name":"명훈", "tier-type":6, "tier-number":4, "position":2, "icon-small":image_server + "37a8GJQT8e", "icon-big":image_server + "1SRuHBoUAi"},
	
	{"name":"따효니", "tier-type":4, "tier-number":3, "position":3, "icon-small":image_server + "2mxHrhNhK0", "icon-big":image_server + "2SKRT1koEK"},
	{"name":"러너", "tier-type":4, "tier-number":4, "position":3, "icon-small":image_server + "27hb4TQNLm", "icon-big":image_server + "2SKRT1kyf8"},
	{"name":"쫀득", "tier-type":5, "tier-number":2, "position":3, "icon-small":image_server + "2mxHrhNy78", "icon-big":image_server + "2SKRT1l7Ni"},
	{"name":"플러리", "tier-type":4, "tier-number":3, "position":3, "icon-small":image_server + "27hb4TQdKS", "icon-big":image_server + "0SZN5LswQZ"},
	{"name":"유나땅", "tier-type":4, "tier-number":4, "position":3, "icon-small":image_server + "1SRuHFTIuq", "icon-big":image_server + "37a8GFivNO"},
	{"name":"김여뉴", "tier-type":5, "tier-number":4, "position":3, "icon-small":image_server + "1SRuHFTRfC", "icon-big":image_server + "1SRuHBtYoa"},
	
	{"name":"김나성", "tier-type":4, "tier-number":4, "position":4, "icon-small":image_server + "2mxHrhOgR0", "icon-big":image_server + "2SKRT1u6mW"},
	{"name":"한동숙", "tier-type":4, "tier-number":4, "position":4, "icon-small":image_server + "0SZN5PXhUc", "icon-big":image_server + "0SZN5M6APU"},
	{"name":"던", "tier-type":4, "tier-number":2, "position":4, "icon-small":image_server + "37a8GJNfWW", "icon-big":image_server + "37a8GG0Py0"},
	{"name":"박잔디", "tier-type":4, "tier-number":4, "position":4, "icon-small":image_server + "37a8GJNnGW", "icon-big":image_server + "1n4kfo9sIS"},
	{"name":"소람잉", "tier-type":5, "tier-number":2, "position":4, "icon-small":image_server + "1n4kfrSzdi", "icon-big":image_server + "0nCDTyI3iY"},
	{"name":"미미미누", "tier-type":4, "tier-number":4, "position":4, "icon-small":image_server + "2SKRT5QbNm", "icon-big":image_server + "27hb4QHPqS"}
];

const tier_list = [
	{"name":"", 			"icon":""},
	{"name":"iron", 		"icon":image_server + "1n4kg0O4Be"},
	{"name":"bronze", 		"icon":image_server + "1SRuHOPSLm"},
	{"name":"silver", 		"icon":image_server + "1n4kg0OJOK"},
	{"name":"gold", 		"icon":image_server + "1SRuHOPhNq"},
	{"name":"platinum", 	"icon":image_server + "0SZN5YU1E6"},
	{"name":"diamond", 		"icon":image_server + "2SKRTEMXnq"},
	{"name":"master", 		"icon":image_server + "0nCDUAT9zE"},
	{"name":"grandmaster",  "icon":image_server + "27hb4cOD4q"},
	{"name":"challenger", 	"icon":image_server + "0nCDUATT1w"}
];

const position_dict = [
	{"name":"top", "icon":image_server + "2mxHrrSkf0"},
	{"name":"jug", "icon":image_server + "1n4kg1Vx1G"},
	{"name":"mid", "icon":image_server + "1n4kg1W6Iu"},
	{"name":"bot", "icon":image_server + "0nCDUBZcAy"},
	{"name":"sup", "icon":image_server + "0SZN5ZbN39"},
];

const manager_list = ["갱맘", "플레임", "큐베", "왜냐맨", "와디드", "프로즌"];
