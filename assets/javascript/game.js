function Pokemon(name, entry) {
    this.name = name;
    this.entry = entry;
}

let game = {
    currentWord: "",
    hiddenWord: "",
    missedLetters: "",
    stateMessage: "",
    wins: 0,
    loses: 0,
    startGuesses: 10,
    guessesLeft: 0,
    isPlaying: true,
    availablePokemon: [],
    currentPokemon: new Pokemon("missingNo", 0),
    pokedex: [],
    keys: ["a","b","c","d","e","f","g","h","i","j","k","l","m",
    "n","o","p","q","r","s","t","u","v","w","x","y","z"],

    getPokemonNames: function () {
        //create new instance of pokeapi's js wrapper, retreive the pokemon_species
        // value from it, then send that value to fillWords()
        let P = new Pokedex.Pokedex({ protocol: 'https' });
        P.getPokedexByName("kanto").then(function (response) {
            //console.log(response.pokemon_entries);
            game.createPokemon(response.pokemon_entries);
        })
    },

    createPokemon: function (val) {
        for (let i = 0; i < val.length; i++) {
            var poke = new Pokemon(val[i].pokemon_species.name, val[i].entry_number);
            this.availablePokemon.push(poke);
        }
        if(localStorage.getItem("POKEDEX") != null)
            this.loadPokedex();
        this.startGame();
    },

    getRandomWord: function () {
        this.currentPokemon = this.availablePokemon[Math.floor(Math.random() * this.availablePokemon.length)];
        console.log("after getrandom word " +this.availablePokemon.length)
        this.currentWord = this.currentPokemon.name;
        for (let i = 0; i < this.currentWord.length; i++) {
            this.hiddenWord += "_";
        }
        if (this.currentWord.indexOf('-') > 0)
            this.compareChar('-');
        this.updateDoc();
        console.log(this.currentWord);
    },

    compareChar: function (char) {
        let indices = [];
        let idx = this.currentWord.indexOf(char);
        while (idx != -1) {
            indices.push(idx);
            idx = this.currentWord.indexOf(char, idx + 1);
        }

        for (let i = 0; i < indices.length; i++) {
            this.hiddenWord = this.hiddenWord.substring(0, indices[i]) +
                char + this.hiddenWord.substring(indices[i] + 1);
        }
        return indices.length;
    },

    updateDoc: function () {
        this.checkGameState();
        document.getElementById("winScore").innerHTML = "Wins: " + this.wins;
        document.getElementById("loseScore").innerHTML = "Loses: " + this.loses;
        document.getElementById("guessesRemaining").innerHTML = "Guesses Left: " + this.guessesLeft;
        document.getElementById("wordToGuess").innerHTML = this.hiddenWord;
        document.getElementById("guessedLetters").innerHTML = this.missedLetters;
        document.getElementById("endGameMessage").innerHTML = this.stateMessage;
        document.getElementById("pokemonCaught").innerHTML = "Pokemon Caught: " + this.pokedex.length;
    },

    checkGameState: function () {
        if (this.hiddenWord === this.currentWord) {
            game.stateMessage = `You caught a 
            ${this.currentPokemon.name.charAt(0).toUpperCase() + this.currentPokemon.name.slice(1)}! 
            Press any key to play again.`;
            game.wins++;
            this.isPlaying = false;
            this.addToPokedex();
        }

        if (this.guessesLeft === 0) {
            game.stateMessage = `The
            ${this.currentPokemon.name.charAt(0).toUpperCase() + this.currentPokemon.name.slice(1)}
             got away... Press any key to play again.`;
            game.loses++;
            this.hiddenWord = this.currentWord;
            this.isPlaying = false;
        }
    },

    loadPokedex: function () {
        let data = JSON.parse(localStorage.getItem("POKEDEX"));
        for (let i = 0; i < data.length; i++)
        {
            this.currentPokemon = new Pokemon(data[i].name, data[i].entry);
            this.addToPokedex();
        }
        //console.log(data);
    },

    addToPokedex: function () {
        this.pokedex.push(this.currentPokemon);
        let newEntry = document.createElement('ls');
        newEntry.style = "max-height: 75px";
        if (this.currentPokemon.entry % 2 == 1)
            newEntry.className = "list-group-item list-group-item-dark d-flex justify-content-around align-items-center p-1";
        else
            newEntry.className = "list-group-item list-group-item-light d-flex justify-content-around align-items-center p-1";
        newEntry.innerHTML = 
        `<div class=" border-right text-center p-0">
        <h5 class="p-2">#${this.currentPokemon.entry}</h5>
        </div>
        <div class="pl-1">
        <h5 class="text-capitalize">${this.currentPokemon.name}</h5>
        </div>
        <div style="">
        <img src="http://pokeapi.co/media/sprites/pokemon/${this.currentPokemon.entry}.png"  style="width: auto; max-height: 100%" class="img-fluid ml-auto" alt="Responsive image">
        </div>`;
        let list = document.getElementById('pokedexEntries');
        list.insertBefore(newEntry, list.childNodes[this.sortPokedex()]);
        this.availablePokemon.splice(this.availablePokemon.indexOf(this.currentPokemon), 1);
        this.pokedex.sort(function (a, b) { return a.entry - b.entry });
        localStorage.setItem("POKEDEX", JSON.stringify(this.pokedex));
        console.log(this.pokedex);
    },

    sortPokedex: function () {
        for(let i = 0; i < this.pokedex.length; i++)
        {
            console.log(this.currentPokemon.entry + " < " + this.pokedex[i].entry)
            if(this.currentPokemon.entry < this.pokedex[i].entry)
            {
                console.log(i);
                return i;
            }
            //return i;
        }
        console.log("this is null");
        return null;
    },

    startGame: function () {
        this.guessesLeft = this.startGuesses;
        this.hiddenWord = "";
        this.missedLetters = "";
        this.stateMessage = "";
        this.isPlaying = true;
        this.getRandomWord();
    }
};

document.addEventListener('keydown', function(event) {
    let key = event.key;
    if (game.isPlaying) {
        // if the key isn't found in currentWord and the key isn't in missingLetters...
        if (game.compareChar(key) === 0 && game.missedLetters.indexOf(key) === -1 && game.keys.indexOf(key) != -1) {
            if (game.missedLetters.length === 0)
                game.missedLetters += key;
            else
                game.missedLetters += ", " + key;
            game.guessesLeft--;
        }
        game.updateDoc();
    }
    else {
        game.startGame();
    }
});


game.getPokemonNames();

