$(document).ready(function(){
	var loadedLetters;
	var score;
	var thisword = [];
	var highscore = [];
	
	loadLetters();
	
	$("#admin").hide();
  
	$('#showadmin').click(function(){
		$( "#admin" ).show();
    });	
	
	$('#hideadmin').click(function(){
		saveLetters();
		loadLetters();
		$( "#admin" ).hide();
    });
	
	$('#word').keypress(function (e) {
		if (e.which == 13) {
			$('#compute').focus().click();
		}
	});
	
	function loadLetters(){
		//betölti a betűlistát, ha nincs tárolt akkor az alapbeállítást használja
		var defaultLetters="A Á B C D E É F G H I Í J K L M N O Ó Ö Ő P Q R S T U Ú Ü Ű V W X Y Z";
		loadedLetters = window.localStorage.getItem("fourdigitsletters");
		if (loadedLetters==null){
			loadedLetters=defaultLetters;
		}
		$('#letters').empty();
		$('#letters').append(loadedLetters);
		$('#inputletters').empty();
		$('#inputletters').val(loadedLetters);
	}
	
	function saveLetters(){
		//menti a betűlistát localstorage-ba
		window.localStorage.setItem("fourdigitsletters", $('#inputletters').val());
	}

	//Szó lista betöltése
	var wordlist = [];
	$.get('wordlist.db', function(data){wordlist = data.split('\n');});

	//Kiértékelés
	$("#compute").click(function() {
		//Betűk betöltése tömbbe
		var letters = [];
		$.each($('#inputletters').val().split(/ +/), function(i, letter){letters.push(letter);});

		//Szó betöltése
		var words = [];
		word = $('#word').val();
		//ha nincs megadva szó akkor figyelmeztet
		if(word==""){
			alert("Nem adott meg szót!");
			return(0);
		}
		
		//mindent átkonvertálunk kisbetűkké
		letters = $.map(letters, function(letter, index) {return letter.toLowerCase();});
		word = word.toLowerCase();
		word = $.trim(word);
		
		//ellenőrzi hogy a betűkből ki lehet-e rakni a szót
		firstcheck = checkLetters();
		if (firstcheck.value == true){
			//ellenőrzi hogy a szó megvan-e a szótárban
			secondcheck = checkWord();
			if(secondcheck.value==true){
				//Helyes válasz esetén tájékoztatja a felhasználót az elért pontszámról
				alert("Az ön pontszáma: " + secondcheck.point + " ezért a szóért: " + secondcheck.result);
				$("#word").val("");
				$('#word').focus();
				//Elkészíti a legjobb eredmények listáját és kiírja a megfelelő helyre
				highscore.push([secondcheck.point,secondcheck.result]);
				highscore.sort();
				highscore.reverse();
				$("#highscore").empty();
				$("#highscore").append("<h3>High Score</h3>");
				for(a=0; a < highscore.length; a++){
					for(b=0; b<2; b++){
						if(b==1){$("#highscore").append(" - ");}
						$("#highscore").append(highscore[a][b]);
					}
					$("#highscore").append("<br>");
				}
			}
			//nem talált a szótárban ilyen szót
			else{
				alert("Nincs ilyen szó!");
				$("#word").val("");
				$('#word').focus();
			}
		}
		//olyan betűt talált ami nincs a felhasználható betűk listáján
		else{
			alert("Ezt a betűt nem használhatja: " + firstcheck.letter);
			$("#word").val("");
			$('#word').focus();
		}
		
		function checkLetters(){
			//Betűk ellenőrzés 
			thisword=[];
			for (var i = 0, len = word.length; i < len; i++) {
				thisword.push(word[i]);
			}
			for (tw=0; tw < thisword.length; tw++){
				if (letters.indexOf(thisword[tw]) == -1){
					return {value: false, letter: thisword[tw]};
				}
			}
			return {value: true, letter:""};
		}

		function checkWord(){
			//Szó ellenőrzés
			var uniqueLetters = [];
			for(wl = 0; wl < wordlist.length; wl++){
				wordlist[wl] = $.trim(wordlist[wl]);
				wordlist[wl] = wordlist[wl].toLowerCase();
				if(word == wordlist[wl]){
					//egyedi betűk kiválogatása
					uniqueLetters = [];
					$.each(thisword, function(j, ul){
						if($.inArray(ul, uniqueLetters) === -1) uniqueLetters.push(ul);
					});
					
					return {value: true, point: uniqueLetters.length, result: word};
				}
			}
			return{value:false, point:"0", result:"none"};
		}
	});
});