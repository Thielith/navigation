var mysql = require('mysql'); 
var io = require('socket.io').listen(33333);
const {exec} = require('child_process');

var con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "p2950",
	database: "test_dwarven"
})


io.sockets.on('connection', function (socket) {
	var clientIp = socket.request.connection.remoteAddress;
	console.log("Someone From " + clientIp + " Connected")
	
	socket.on('getPlayerCoin', function(id){
		var sql = "SELECT coin FROM units WHERE id = " + id + ";"
		con.query(sql, function(err, result){
			if (err) throw err;
			socket.emit('getPlayerCoin', result)
		})
	})
	
	socket.on('getPlayerItems', function(id){
		var send;
		var sql = "SELECT itemID, quantity, qualityID FROM items WHERE ownerID = " + id + ";"
		con.query(sql, function(err, result){
			send = result
			if (err) throw err;
			var ii = 0
			for(i = 0; i < result.length; i++){
				console.log("loop")
				var sql = "SELECT nameID, basePrice FROM _item_ WHERE id = " + send[i].itemID
				con.query(sql, function(err, resulta){
					if (err) throw err;
					send[ii].name = resulta[0].nameID
					ii += 1
				})
			}
			setTimeout(function(){
				socket.emit('getPlayerItems', send)
			}, 250)
			
		})
	})
	
	socket.on('convert', function(item){
		var sendLine = []
		var sql = "SELECT * FROM list_of_items WHERE ItemID = " + item + ";"
		con.query(sql, function(err, result){
			if (err) throw err;
			console.log(result)
			var s = result[0].ItemName
			s = s.toString()
			var p = result[0].Price
			p = p.toString()
			
			sendLine.push(s)
			sendLine.push(p)
			
			socket.emit(
				'convert', sendLine
			);
			
		})

	})
	
	//Edit-Update Transaction Database
	socket.on('transaction', function (info) {
		var sendLine = ""
		
		for(i = 0; i < info.length; i++){
			console.log(info[i])
			sendLine += info[i] + " "
		}
		
		sendLine += "transaction"
		
		var e = 'python database.py ' + sendLine
		console.log(e)
		exec(e);
	});
	
	
	socket.on('disconnect', function(){
		console.log("Someone From " + clientIp + " disconnected")
	})
});
