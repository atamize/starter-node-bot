var Botkit = require('botkit')
//var logger = require('morgan')

var token = process.env.SLACK_TOKEN

// Beep Boop specifies the port you should listen on default to 8080 for local dev
var PORT = process.env.PORT || 8080

// Slack slash command verify token
var VERIFY_TOKEN = process.env.SLACK_VERIFY_TOKEN

var controller = Botkit.slackbot({
  // reconnect to Slack RTM when connection goes bad
  retry: Infinity,
  debug: false
})

// Assume single team mode if we have a SLACK_TOKEN
if (token) {
  console.log('Starting in single-team mode')
  var myBot = controller.spawn({
    token: token
  }).startRTM(function (err, bot, payload) {
    if (err) {
      throw new Error(err)
    }

    console.log('Connected to Slack RTM')
  })
  
	// fetch and store team information
	myBot.api.team.info({}, function (err, res) {
	  if (err) {
		return console.error(err)
	  }

	  controller.storage.teams.save({id: res.team.id}, (err) => {
		if (err) {
		  console.error(err)
		}
	  })
	})
// Otherwise assume multi-team mode - setup beep boop resourcer connection
} else {
  console.log('Starting in Beep Boop multi-team mode')
  require('beepboop-botkit').start(controller, { debug: true })
}

controller.setupWebserver(PORT, function (err, webserver) {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  //webserver.use(logger('tiny'))
  // Setup our slash command webhook endpoints
  controller.createWebhookEndpoints(webserver)
})

var words = ['ACNE','ACRE','ANDROID','ADVERTISE','AIRCRAFT','AISLE','ALLIGATOR','ALLOY','AMERICA','ANKLE','APATHY','APPLAUSE','AGENT','APPLICATION','ARCHAEOLOGY','ARISTOCRAT','ARM','ARMADA','ANCHOR','ASTRONAUT',
'ATHLETE','ATLANTIS','ANNUAL','AVOCADO','BABYSITTER','SPINE','BAG','BAGUETTE','BALD','BALLOON','BANANA','BEE','BASEBALL','BRIEF','BASKETBALL','BAT','BATTERY','BEACH','BEAN','BEDBUG',
'BEER','BATTLE','BELT','FARM','BICYCLE','BIG','BOND','BILLBOARD','BIRD','BIRTHDAY','BITE','BORDER','BLANKET','BLEACH','BLIMP','BLOSSOM','BLUEPRINT','BLUNT','BLUR','BASS',
'BOAT','BUTTER','BOBSLED','BODY','BOMB','BUTLER','BOOK','BOOTH','BOW','BOX','BOY','BRAINSTORM','BRAND','BRAVE','BRIDE','BRIDGE','BROCCOLI','BROKEN','BROOM','BRUISE',
'BRITTLE','BUBBLE','BUDDY','BUFFALO','BULB','BUNNY','BUS','BUY','CABIN','CAFETERIA','CAKE','CALCULATOR','CAMP','CAN','CANADA','CANDLE','CANDY','CAPE','CAPITALISM','CAR',
'CARDBOARD','CARTOGRAPHY','CAT','CD','CEILING','CELL','CENTURY','CHAIR','CHALK','CHAMPION','CHARGER','CHEERLEADER','CHEF','CHESS','CHEW','CHICKEN','CHILD','CHINA','CHOCOLATE','CHURCH',
'CIRCUS','CLAY','CLIFF','CLOAK','CANE','CLOWN','CLUE','COACH','COAL','CONTACT','COVER','COLD','COLLEGE','COMFORT','COMPUTER','CONE','CONCERT','CRAFT','CONVERSATION','COOK',
'COKE','CORD','CONDO','COAT','COUGH','COW','COWBOY','CRAYON','CREAM','CRISP','CRITICIZE','CROW','CRUISE','CLIP','CRUST','CUFF','CURTAIN','CUT','CAREER','DONUT',
'DART','DAWN','DAY','DEEP','DEFECT','DENT','DENTIST','DESK','DELAY','DIRECTOR','DIRTY','DIVISION','DRAFT','DIVE','DOCTOR','DOG','DOJO','DOLL','DOMINOES','DOOR',
'DATA','DRAIN','DRAW','DREAM','DRESS','DRINK','DRIP','DIGITAL','DRONE','DUCK','DUMP','DUNK','DUST','EAR','EAT','ENERGY','ELBOW','ELECTRICITY','ELEPHANT','ELEVATOR',
'ELF','ELM','ENGINE','ENGLAND','COMPANY','ESCALATOR','ENDLESS','EUROPE','EVOLUTION','ECHO','ENEMY','FAN','FANCY','FAST','FEAST','FENCE','FEUD','FIDDLE','FILE','FINGER',
'FIRE','FIRST','FLY','FIX','FILTER','FLAG','FLOOR','FLASHLIGHT','FLOCK','FLOAT','FLOWER','FLU','FLUSH','FLOW','FOG','FOIL','FOOTBALL','FOREHEAD','FOREVER','FORT',
'FRANCE','FRONT','FREIGHT','FRY','FROG','MEMORY','GORGE','GAME','GARBAGE','GARDEN','GASOLINE','GEM','GINGER','GALAXY','GIRL','GLASSES','GOBLIN','GOLD','GOODBYE','GRANDPA',
'GRAPE','GRASS','GANG','GRAY','GREEN','GUITAR','GUM','GRAPHIC','HAIR','HALF','HANDLE','HAIL','HANG','HAPPY','HAT','HATCH','HELMET','HEART','HEDGE','HELICOPTER',
'HASH','HIDE','HILL','HOCKEY','HOMEWORK','HOLD','HUNTER','HORSE','HOSE','HOT','HOUSE','HAND','HUG','HUM','HUNGRY','HURDLE','HURT','HUT','ICE','ZOMBIE',
'INN','INSTANT','INTERN','INTERNET','INVITATION','IRONIC','INTELLIGENCE','IVY','JUNIOR','JAPAN','JEANS','JELLY','JET','JOINT','JOG','JOURNEY','JUMP','KEY','KILLER','KILOGRAM',
'KING','KITCHEN','KITE','KNEE','LAMP','KNIFE','KNIGHT','KOALA','LAB','LADDER','LADYBUG','LAG','LAND','LAP','LAUGH','LAUNDRY','LAW','LAWN','LAZY','LEAK',
'LEG','LETTER','LEVEL','LIFESTYLE','LOAD','LIGHT','LIGHTSABER','LIME','LION','LIZARD','LOG','LIVER','LOLLIPOP','LAST','LOYALTY','LUNCH','BACTERIA','LYRICS','MACHINE','MACHO',
'MAILBOX','MAMMOTH','MARK','MARS','MASCOT','MASH','MATCH','MATE','MATTRESS','MESS','MEXICO','MEDICINE','MINE','MISTAKE','MODERN','MOLD','MILK','MONDAY','MONEY','MONITOR',
'MONSTER','EAST','MOON','MOP','MOTH','MOTORCYCLE','MOUNTAIN','MOUSE','MOUSTACHE','MUD','MUSIC','MUTE','NATURE','NEGOTIATE','NEIGHBOR','NEST','NEUTRON','NORTH','NIGHT','NIGHTMARE',
'NOSE','OAR','OBSERVATORY','OFFICE','OIL','OLD','OLYMPIAN','OPERATION','ONION','ORBIT','ORGAN','ORGANIZE','OCTOPUS','SCALE','OVATION','OVERTURE','PAGE','PAINT','PAJAMAS','PALACE',
'PANTS','PAPER','POOR','PARK','PARODY','PARTY','PASSWORD','PASTRY','PAWN','PEAR','PEN','PENCIL','YOGA','PENIS','PENNY','PEPPER','PERSONAL','PHILOSOPHER','PHONE','PHOTOGRAPH',
'PIANO','PICNIC','PIG','PILLOW','PILOT','PINCH','POP','PRINT','PIRATE','PLAID','PLAN','PLANK','PLATE','PLATYPUS','PLAYGROUND','PLOW','PLUMBER','POCKET','POEM','POINT',
'POLE','PUMP','PONG','POOL','POPSICLE','POPULATION','PORTFOLIO','POSITIVE','POST','PRINCESS','PROFESSIONAL','PRIEST','PSYCHOLOGIST','PUBLISHER','PUNK','PUPPET','PUPPY','PUSH','PUZZLE','QUARANTINE',
'QUEEN','QUICKSAND','QUIET','RACE','RADIO','RAFT','RAG','RAINBOW','RAISE','RALLY','RAY','RECYCLE','RED','REGRET','FRIEND','RETALIATE','RIB','RIDDLE','RIM','RINK',
'ROLL','ROOM','ROSE','ROUND','ROW','RUBBER','RUNT','RENT','SAD','SAFE','SALMON','SALT','SWITCH','SWIFT','SANDWICH','SASH','SATELLITE','SCAR','SCARED','SCHOOL',
'SCOUNDREL','SHIELD','SWELL','SHELL','SEASON','SENTENCE','STRING','SET','SHAFT','SCOPE','SHAMPOO','SHARK','SHEEP','SHIFT','SHERIFF','SHIPWRECK','SHIRT','SHOE','SHORT','SHOWER',
'SHRINK','SICK','SNEAK','SILO','SINGER','SIP','SKATE','SLACK','SKI','SLAM','SLEEP','SLING','SLOW','SAGE','SMITH','SNEEZE','SNOW','SPILL','SONG','SPACE',
'SPARE','SPEAKERS','SPIDER','SPIT','SPONGE','SPOOL','SPOON','SPRING','CENTIPEDE','SPY','SQUARE','SCOOP','STAIRS','STANDING','STAR','STATE','STICK','STAKEHOLDER','SPOTLIGHT','STING',
'STOVE','STOWAWAY','STRAW','STREAM','STEM','STRONG','STUDENT','SUN','SEARCH','SUSHI','SWAMP','SWARM','SWEATER','SWIMMING','SWING','TASER','TALK','TAXI','TEACHER','TEAPOT',
'TEENAGER','TELEPHONE','TEN','TENNIS','THIEF','THINK','THRONE','TOUGH','THUNDER','TIDE','TIGER','TIME','TWEAK','TIPTOE','TIMBER','TIRED','TISSUE','TOAST','TOILET','TOOL',
'TOMB','TORNADO','TOURNAMENT','TRACTOR','TRAIN','TRASH','TREASURE','TREE','TRIANGLE','TRIP','TRUCK','TUB','TUBA','TUTOR','TELEVISION','TEST','TWIG','TWITTER','TYPE','UNEMPLOYED',
'UPGRADE','VEST','VISION','WANDER','WATER','WATERMELON','WAX','WEDDING','WEED','WELDER','WAGON','WHEELCHAIR','WHIP','WHISK','WHISTLE','WHITE','WEST','WILL','PUNCH','WINTER',
'WISH','WOLF','WOOL','WORLD','WORM','WRESTLE','ZOOM','WINE','ZEN','ZERO','ZIPPER','ZONE','ZOO','JUICE','GROW','CLUB','MONKEY','FACE','JUSTICE','SNAKE',
'COSTUME','POLICE','CARPET','GYM','BONE','LIMOUSINE','PLANE','CIRCLE','AUSTRALIA','INDIA','SPAIN','BRAZIL','ITALY','GERMANY','KOREA','BLUE','YELLOW','BLACK','ORANGE','APPLE',
'BROWN','DEAL','BANK','SCORE','PLAY','PENGUIN','BOOT','EYE','AIR','WIND','HAMMER','DRILL','NAIL','SCREW','STOCK','HEAD','FISH','LOCK','DRY','STEAL',
'CAMEL','BEAR','SHIP','DANCE','ROMANCE','LAWYER','SCIENTIST','NURSE','PRESIDENT','FIGHTER','PEASANT','NUT','YARD','COURT','FIELD','TRACK','TENT','CENTER','COMIC','FILM',
'VIDEO','PAINTING','OCEAN','CONTINENT','BOARD','MARCH','SUMMER','FALL','CATCH','THROW','GIFT','CRANE','COAST','BLADE','BUSINESS','MOUTH','DEVIL','ANGEL','EAGLE','HIP',
'DRUM','POWER','ROAD','STREET','AVENUE','ALLEY','FORK','GUN','SPARK','BREAD','PASTA','RICE','RAIN','CLOUD','STORM','JOKE','DOCK','CHEMICAL','CEMETARY','BEAVER',
'GRAIN','SAND','CONCRETE','METAL','CHOICE','PIZZA','CAPTAIN','COOKIE','NINJA','BLOCK','WAVE','CTHULHU','PEGASUS','YETI','UNICORN','DRAGON','ABYSS','SKY','HOLE','TEETH',
'COMET','ROCK','GROUND','SATURN','MERCURY','VENUS','JUPITER','NEPTUNE','URANUS','EARTH','RAPTOR','CLUTCH','PURSE','COIN','NOTE','PRISON','CINEMA','STORE','LEAF','SOCCER',
'STADIUM','CRICKET','T-REX','TANK','RIVER','FOREST','VOLCANO','SILVER','ANIME','LASER','CORPSE','STEAM','FOUNTAIN','LIGHTNING','BARRIER','CHEESE','SPECTACLE','MERMAID','BRAIN','MAGIC',
'TOMATO','DECK','BATHROOM','EGG','CARD','BEAT','STROKE','ROOT','SINK','MATRIX','FANTASY','RUSSIA','POLAND','IRAQ','RAGE','IRAN','EGYPT','TABLE','BED','SOUP',
'CHIP','HOPE','LOVE','PHOENIX','ZEBRA','COFFEE','TEA','MASK','CORE','CHRISTMAS','WATCH','GRAVITY','DUEL','REACTION','BEETLE','DRAMA','LUST','HARVEST','BOULDER','POKER',
'DEBT','GAUGE','SOAP','DJ','HORDE','ZEALOT','CAVE','TEMPLE','PORCUPINE','PEACH','ROPE','CRIMINAL','DESERT','TUNDRA','JUNGLE','GUARD','WRAITH','GHOST','WITCH','WIZARD',
'HOBBIT','DWARF','BUSH','STEAK','FRIDGE','TOASTER','OVEN','ATOM','PORT','DOVE','NEEDLE','THREAD','FEVER','CASTLE','TURTLE','COTTON','ARCADE','FATHER','MOTHER','BABY',
'SNOWMAN','SHOP','SILK','SUBWAY','HOTEL','GOLF','CROCODILE','HAWK','DANGER','CLOCK','BOTTLE','NEW YORK','TORONTO','CALIFORNIA','CAPITAL','SUGAR','PLANT','FLOOD','CASE','DETECTIVE',
'FUSE','HERO','KICK','SONIC','RUN','DODGE','ALIEN','UFO','PARAGLIDER','VR','BLOOD','PARACHUTE','WIRE','TIRE','RESISTANCE','GRIP','HEAVY','FLASH','FLORIDA','WHALE',
'DOLPHIN','ISLAND','ROUGH','SOUL','BOWL','FREE','SMOKE','DARK','MIRROR','SUBMARINE','VACUUM','VACATION','WEB','GARAGE','EMPTY','ODOR','SKIN',
'SOUTH','PATH','CALL','FADE','CORN','CORNER','IRON','RUST','BUST','BROAD','PURPLE','GORILLA','TEAR','HEAVEN','HELL','PANEL','CHIEF','FIST','ANT','GROOVE',
'WELL','SPELL','STALK','STOOL','VAMPIRE','BLIND','POUND','CHAIN','CODE','BOLT','QUEST','CROSS','BEAM','JAM','MODEL'];

var used = [];
var cells = [];
var gameState = 'formTeams';

var users = [];

var teams = [
	{
		type: 'red',
		name: 'Red Team',
		spymaster: null,
		max: 0,
		members: []
	},
	{
		type: 'blue',
		name: 'Blue Team',
		spymaster: null,
		max: 0,
		members: []
	}
];

var currentTeam;
var gameIsOver = false;
var lastVote = '';

function getUser(id) {
    for (u = 0; u < users.length; u++) {
        if (users[u].id == id) {
            return users[u];
        }
    }
    return null;
}

function getOtherTeam(team) {
	if (teams[0] == team)
		return teams[1];
	else
		return teams[0];
}

function showTeams() {
	var str = '';
	for (i = 0; i < teams.length; i++) {
		str += '*' + teams[i].name + '* Spymaster is ';
		if (teams[i].spymaster === null)
			str += '[NONE]';
		else
			str += teams[i].spymaster.name;
		
		str += '\nCodebreakers: ';
		for (j = 0; j < teams[i].members.length; j++) {
			str += teams[i].members[j].name;
			if (j < teams[i].members.length - 1)
				str += ', ';
		}
		
		str += '\n\n';
	}
	return str;
}

function leave(user) {
	for (i = 0; i < teams.length; i++) {
		if (teams[i].spymaster === user) {
			teams[i].spymaster = null;
			return user.name + ' left ' + teams[i].name;
		}
		for (j = 0; j < teams[i].members.length; j++) {
			if (teams[i].members[j] === user) {
				teams[i].members.splice(j, 1);
				return user.name + ' left ' + teams[i].name;
			}
		}
	}
}

function getOrAddUser(_message, username) {
	var user = getUser(_message.user);
	if (user) {
		leave(user);
	} else {
		user = {
			id: _message.user,
			name: username,
			message: _message
		};
		users.push(user);
		
		controller.storage.users.get(_message.user, function(err, storedUser) {
			if (!err && storedUser) {
				var u = getUser(storedUser.id);
				if (u) {
					u.name = storedUser.name;
				}
			}
		});
	}
	user.channel = _message.channel;
	return user;
}

function teamOpHelper(user, team, op) {
	var idx;
	for (idx = 0; idx < teams.length; idx++) {
		if (teams[idx].type == team) {
			return op(teams[idx], user);
		}
	}
	return 'Invalid team';
}

function teamOp(bot, _message, team, op) {
	var u = getUser(_message.user);
	if (u) {
		leave(u);
		u.channel = _message.channel;
		bot.reply(_message, teamOpHelper(u, team, op));
	} else {
		bot.api.users.info({token: token, user: _message.user}, function(err, response) {
			var username = _message.user;
			if (response.ok) {
				username = response.user.name;
			}
			
			u = getOrAddUser(_message, username);
			bot.reply(_message, teamOpHelper(u, team, op));
		});
	}
}

function joinOp(team, user) {
	team.members.push(user);
	return user.name + ' joined ' + team.name;
}

function spyOp(team, user) {
	if (team.spymaster && team.spymaster !== user) {
		team.members.push(team.spymaster);
	}
	team.spymaster = user;
	return user.name + ' is the Spymaster for ' + team.name;
}

function shuffle(arr) {
	var i;
	for (i = 0; i < arr.length; i++) {
		var c = arr[i];
		var idx = randomRange(0, arr.length);
		arr[i] = arr[idx];
		arr[idx] = c;
	}
}

function joinRandom(user) {
	var t = randomRange(0, 2);
	var team = teams[t];
		
	if (team.spymaster === null) {
		team.spymaster = user;
		return user.name + ' is the Spymaster for ' + team.name;
	}
	
	var teamOther = teams[(t + 1) % teams.length];
	if (teamOther.spymaster === null) {
		teamOther.spymaster = user;
		return user.name + ' is the Spymaster for ' + teamOther.name;
	}
	
	if (team.members.length == teamOther.members.length || team.members.length < teamOther.members.length) {
		team.members.push(user);
		return user.name + ' has joined ' + team.name;
	}
	
	teamOther.members.push(user);
	return user.name + ' has joined ' + teamOther.name;
}

function shuffleTeams() {
	var spies = [];
	var plebs = [];
	
	// Clear current teams
	for (i = 0; i < teams.length; i++) {
		if (teams[i].spymaster) {
			spies.push(teams[i].spymaster);
			teams[i].spymaster = null;
		}
		for (j = 0; j < teams[i].members.length; j++) {
			plebs.push(teams[i].members[j]);
		}
		teams[i].members.length = 0;
	}
	
	// Assign plebs as spymasters
	shuffle(plebs);
	var taken = 0;
	for (i = 0; i < teams.length && i < plebs.length; i++) {
		teams[i].spymaster = plebs[i];
		taken++;
	}
	
	// Add former spies to plebs and fill codebreakers with the remainder
	if (taken > 1) {
		plebs.splice(0, taken);
		plebs = plebs.concat(spies);
		shuffle(plebs);
		var pivot = plebs.length / 2;
		for (i = 0; i < plebs.length; i++) {
			if (i < pivot)
				teams[0].members.push(plebs[i]);
			else
				teams[1].members.push(plebs[i]);
		}
	}
	return showTeams();
}

function startGame(bot) {
	setupBoard();
	gameState = 'playing';
	
	if (teams[0].spymaster) {
		bot.startPrivateConversation(teams[0].spymaster.message,function(err,dm) {
			dm.say(boardStatus(teams[0]));
		});
	}
	
	if (teams[1].spymaster) {
		bot.startPrivateConversation(teams[1].spymaster.message,function(err,dm) {
			dm.say(boardStatus(teams[1]));
		});
	}
    
	return boardStatus() + '\n\n' + teams[currentTeam].name + ' goes first.';
}

function reset() {
	for (i = 0; i < teams.length; i++) {
		teams[i].spymaster = null;
		teams[i].members.length = 0;
	}
	gameState = 'formTeams';
	gameIsOver = false;
}

function clearVotes() {
	for (i = 0; i < teams.length; i++) {
		for (j = 0; j < teams[i].members.length; j++) {
			teams[i].members[j].vote = '';
		}
	}
	lastVote = '';
}

function endTurn(bot) {
	clearVotes();
	currentTeam = (currentTeam + 1) % teams.length;
	
	if (teams[currentTeam].spymaster) {
		bot.startPrivateConversation(teams[currentTeam].spymaster.message,function(err,dm) {
			dm.say(boardStatus(teams[currentTeam]));
		});
		return teams[currentTeam].spymaster.name + ', your turn to play for ' + teams[currentTeam].name;
	} else {
		return teams[currentTeam].name + ', it\'s your turn; you need a Spymaster though';
	}
}

function randomRange(min, max) {
	return Math.floor(min + (Math.random() * (max - min)));
}

function recycle() {
	words = words.concat(used);
	used.length = 0;
}

function setupBoard() {
	var idx, i;
	cells.length = 0;
	
	if (words.length < 25) {
		recycle();
	}

	for (i = 0; i < 25; i++) {
	    idx = randomRange(0, words.length);
		var removed = words.splice(idx, 1);
	    
	    var cell = {
	    	word: removed[0],
	    	state: 'hidden',
	    	type: 'red',
	    };
	    
	    cells.push(cell);
	    used.push(cell.word);
	}
	
	var flip = randomRange(0, 2);
	var types = ['red', 'blue'];
	
	i = 0;
	for (; i < 8; i++) {
		cells[i].type = types[flip];
	}
	teams[flip].max = 8;
	
	flip = (flip + 1) % 2;
	for (; i < 17; i++) {
		cells[i].type = types[flip];
	}
	teams[flip].max = 9;
	currentTeam = flip;
	
	flip = randomRange(17, 25);
	for (; i < 25; i++) {
		if (i == flip)
			cells[i].type = 'bomb';
		else
			cells[i].type = 'neutral';
	}
	
	shuffle(cells);
}

function boardStatus(team) {
	var board = '```';
	var scores = [0, 0];
	var spacing = 16;
	
	for (i = 0; i < cells.length; i++) {
		var w = '';
		var cell = cells[i];
		if (team || cell.state == 'revealed') {
			if (cell.type == 'red') {
				if (team && cell.state == 'hidden') {
					if (team.type == 'red')
						w = cell.word;
					else
						w = cell.word.toLowerCase() + '[R]';
				} else {
					w = '[R]';
				}
				scores[0]++;
			} else if (cell.type == 'blue') {
				if (team && cell.state == 'hidden') {
					if (team.type == 'blue')
						w = cell.word;
					else
						w = cell.word.toLowerCase() + '[B]';
				} else {
					w = '[B]';
				}
				scores[1]++;
			} else if (cell.type == 'neutral') {
				if (team && cell.state == 'hidden')
					w = cell.word.toLowerCase() + '[N]';
				else
					w = '[N]';
			} else if (cell.type == 'bomb') {
				if (team && cell.state == 'hidden')
					w = cell.word.toLowerCase() + '[X]';
				else
					w = '[X]';
			}
		} else if (cell.state == 'hidden') {
			w = cell.word;
		}
		board += w;
		
		if (((i+1) % 5) === 0) {
	    	board += '\n';
		} else {
			for (j = w.length; j < spacing; j++) {
				board += ' ';
			}
		}
	}
	board += '```';
	
	if (team)
		return board;
		
	board += '\n' + teams[0].name + ': ' + scores[0] + '/' + teams[0].max + ', ';
	board +=  teams[1].name + ': ' + scores[1] + '/' + teams[1].max;
	for (i = 0; i < teams.length; i++) {
		if (teams[i].max == scores[i]) {
			board += '\n\n*********************************\n';
			board += teams[i].name + ' wins!!!\n';
			board += '*********************************';
			gameIsOver = true;
			return board;
		}
	}
	return board;
}

function agree(user, index, arr) {
	if (index === 0)
		return true;
	else
		return (user.vote === arr[index - 1].vote);
}

function showVotes() {
	var msg = '';
	var members = teams[currentTeam].members;
	
	if (members.length == 0) {
		return 'There are no players on ' + teams[currentTeam].name;
	}
	
	for (i = 0; i < members.length; i++) {
		if (members[i].vote === null || members[i].vote === '')
			msg += members[i].name + ' has not voted yet\n';
		else
			msg += members[i].name + ' voted for ' + members[i].vote + '\n';
	}
	return msg;
}

function vote(user, word, force, bot) {
	var team = null;
	for (i = 0; i < teams.length; i++) {
		if (teams[i].members.indexOf(user) != -1) {
			if (!force && i != currentTeam) {
				return user.name + ': it is not your turn';
			}
			team = teams[i];
			break;
		}
	}
	
	if (!force && team === null) {
		return user.name + ' doesn\'t have the ability to vote.';
	}
	
	var upper = word.toUpperCase();
	for (i = 0; i < cells.length; i++) {
		var cell = cells[i];
		if (cell.word == upper) {
			if (cell.state == 'revealed') {
				return upper + ' has already been revealed.';
			}
			user.vote = upper;
			lastVote = upper;
			
			var msg = user.name + ' voted for ' + upper;
			var correct = false;
			var hitBomb = false;
			
			if (force || team.members.every(agree)) {
				if (team === null) {
					team = teams[currentTeam];
				}
				
				cell.state = 'revealed';
				msg += '\n\n';
				
				if (team.type === cell.type) {
					msg += cell.word + ' was correct!';
					correct = true;
				} else if (cell.type == 'bomb') {
					msg += ':bomb: You hit the bomb :bomb:!';
					gameIsOver = true;
					hitBomb = true;
				} else {
					msg += cell.word + ' was incorrect.';
				}
			} else {
				return msg;
			}
			
			msg += '\n' + boardStatus();
			
			if (gameIsOver) {
				gameState = 'formTeams';
				gameIsOver = false;
				
				if (hitBomb)
					msg += '\n\n' + team.name + ' loses!';
			} else if (correct) {
				msg += '\n\n' + team.name + ', it is still your turn';
				clearVotes();
			} else {
				msg += '\n\n' + endTurn(bot);
			}
			return msg;
		}
	}
	
	if (upper == 'END TURN') {
		user.vote = upper;
		lastVote = upper;
		var msg = user.name + ' voted to END TURN';
		if (force || team.members.every(agree)) {
			msg += '\n\n' + boardStatus() + '\n\n' + endTurn(bot);
		}
		return msg;
	}
	
	return upper + ' is not valid.';
}

controller.hears(['call me (.*)', 'my name is (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var name = message.match[1];
    controller.storage.users.get(message.user, function(err, user) {
        if (!user) {
            user = {
                id: message.user,
            };
        }
        user.name = name;
		
		var u = getUser(message.user);
		if (u) {
			u.name = name;
		}
		
        controller.storage.users.save(user, function(err, id) {
            bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
        });
    });
});

controller.hears(['reset'], 'direct_message,direct_mention,mention', function(bot, message) {
    reset();
    bot.reply(message, 'Teams cleared; please join a team');
});

controller.hears(['start'], 'direct_message,direct_mention,mention', function(bot, message) {
    var msg = startGame(bot);
    bot.reply(message, msg);
});

controller.hears(['spy red'], 'direct_message,direct_mention,mention', function(bot, message) {
    teamOp(bot, message, 'red', spyOp);
});

controller.hears(['spy blue'], 'direct_message,direct_mention,mention', function(bot, message) {
    teamOp(bot, message, 'blue', spyOp);
});

controller.hears(['join red'], 'direct_message,direct_mention,mention', function(bot, message) {
    teamOp(bot, message, 'red', joinOp);
});

controller.hears(['join blue'], 'direct_message,direct_mention,mention', function(bot, message) {
    teamOp(bot, message, 'blue', joinOp);
});

controller.hears(['join random'], 'direct_message,direct_mention,mention', function(bot, message) {
	var u = getUser(message.user);
	if (u) {
		leave(u);
		u.channel = message.channel;
		bot.reply(message, joinRandom(u));
	} else {
		bot.api.users.info({token: token, user: message.user}, function(err, response) {
			var username = message.user;
			if (response.ok) {
				username = response.user.name;
			}
			
			u = getOrAddUser(message, username);
			bot.reply(message, joinRandom(u));
		});
	}
});

controller.hears(['show teams'], 'direct_message,direct_mention,mention', function(bot, message) {
    var msg = showTeams();
    bot.reply(message, msg);
});

controller.hears(['status'], 'direct_message,direct_mention,mention', function(bot, message) {
	if (gameState == 'playing') {
		var msg = boardStatus() + '\n\nIt is ' + teams[currentTeam].name + '\'s turn';
		bot.reply(message, msg);
	} else {
		bot.reply(message, 'Game hasn\'t started yet');
	}
});

controller.hears(['vote (.*)'], 'direct_mention,mention', function(bot, message) {
	if (gameState == 'formTeams') {
		bot.reply(message, 'Game hasn\'t started yet');
		return;
	}
	
	var word = message.match[1];
	var user = getUser(message.user);
	if (user) {
		var msg = vote(user, word, false, bot);
		bot.reply(message, msg);	
	}
});

controller.hears(['agree'], 'direct_mention,mention', function(bot, message) {
	if (gameState == 'formTeams') {
		bot.reply(message, 'Game hasn\'t started yet');
		return;
	}
	
	if (lastVote !== '') {
		var user = getUser(message.user);
		if (user) {
			bot.reply(message, vote(user, lastVote, false, bot));
		}
	} else {
		bot.reply(message, 'No votes have been cast yet');
	}
});

controller.hears(['end turn'], 'direct_message,direct_mention,mention', function(bot, message) {
	if (gameState == 'formTeams') {
		bot.reply(message, 'Game hasn\'t started yet');
		return;
	}
	
	var user = getUser(message.user);
	if (user) {
		var msg = vote(user, 'END TURN', false, bot);
		bot.reply(message, msg);	
	}
});

controller.hears(['force (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
	if (gameState == 'formTeams') {
		bot.reply(message, 'Game hasn\'t started yet');
		return;
	}
	
	var word = message.match[1];
	var user = getUser(message.user);
	if (user) {
		var msg = vote(user, word, true, bot);
		bot.reply(message, msg);
	}
});

controller.hears(['show votes'], 'direct_message,direct_mention,mention', function(bot, message) {
	if (gameState == 'formTeams') {
		bot.reply(message, 'Game hasn\'t started yet');
		return;
	}
    var msg = showVotes();
    bot.reply(message, msg);
});

controller.hears(['whose turn'], 'direct_message,direct_mention,mention', function(bot, message) {
	if (gameState == 'formTeams') {
		bot.reply(message, 'Game hasn\'t started yet');
		return;
	}
    bot.reply(message, 'It is ' + teams[currentTeam].name + '\'s turn');
});

controller.hears(['leave'], 'direct_message,direct_mention,mention', function(bot, message) {
	var msg = leave(getUser(message.user));
    bot.reply(message, msg);
});

controller.hears(['shuffle'], 'direct_mention,mention', function(bot, message) {
	var msg = shuffleTeams();
    bot.reply(message, msg);
});

controller.hears(['kick (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var t, m;
    var name = message.match[1];
	for (t = 0; t < teams.length; t++) {
	    for (m = 0; m < teams[t].members.length; m++) {
	        if (teams[t].members[m].name == name) {
	            msg = leave(teams[t].members[m]);
	            bot.reply(message, msg);
	            return;
	        }
	    }
	}
	bot.reply(message, name + ' does not exist');
});

controller.hears(['check'], 'direct_message,direct_mention,mention', function(bot, message) {
    user = getUser(message.user);
    for (i = 0; i < teams.length; i++) {
        if (teams[i].spymaster === user) {
            bot.startPrivateConversation(message,function(err,dm) {
                dm.say(boardStatus(teams[i]));
            });
            return;
        }
    }
    bot.reply(message, 'You are not a spymaster');
});

controller.hears(['help'], 'direct_message,direct_mention,mention', function(bot, message) {
	var msg = 'Preface all commands with @sb, or direct message it\n\n' +
	    '*call me [name]* OR *my name is [name]* - register your name\n' +
	    '*join red* - join the Red Team as a codebreaker\n' + 
	    '*join blue* - join the Blue Team as a codebreaker\n' +
		'*join random* - join a random team\n' +
	    '*spy red* - become the Spymaster for Red Team\n' +
	    '*spy blue* - become the Spymaster for Blue Team\n' +
		'*shuffle* - randomize current teams\n' +
	    '*start* - start a new game (clears current game progress)\n' + 
	    '*status* - display the current board status\n' +
	    '*show teams* - display members of each team\n' +
	    '*check* - get sent your team\'s remaining codenames if you are the Spymaster\n' +
	    '*vote [codename]* - vote for a codename on the board\n' +
		'*agree* - vote for the last codename voted in by a teammate\n' +
	    '*end turn* - vote to end the turn\n' + 
	    '*show votes* - display who voted for what\n' + 
	    '*whose turn* - display which team currently has the board\n' +
	    '*leave* - leave a team\n' +
	    '*kick [player]* - kick a player off their team\n' +
	    '*reset* - clears all teams\n' +
	    '*force* [codename] - force a codename to go through regardless of votes\n' +
	    '\n\nVotes must be either unanimous or forced to be accepted';
	    bot.reply(message, msg);
});

controller.on('slash_command', function (bot, message) {
	// Validate Slack verify token
	if (message.token !== VERIFY_TOKEN) {
		return bot.res.send(401, 'Unauthorized')
	}

	switch (message.command) {
		case '/beepboop':
			bot.replyPrivate(message, 'boopbeep')
			break
		case '/vote':
			bot.replyPublic(message, 'Yeah, you voted for ' + message.text);
			break;
		default:
			bot.replyPrivate(message, "Sorry, I'm not sure what that command is");
	}
});

controller.hears(['h4x (.*)'], 'direct_message', function(bot, message) {
    var msg = message.match[1];
	var user = getUser(message.user);
	message.channel = user.channel;
	bot.reply(message, msg);
});

controller.hears(['recycle names'], 'direct_message,direct_mention,mention', function(bot, message) {
    recycle();
	bot.reply(message, 'Recycled codenames (used codenames can show up again)');
});
