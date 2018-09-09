import {game} from './game.js';
import {gameScene,LogoScreen,TitleScreen} from './classes/scenes.js';
import {gameObject} from './classes/objects.js';
import {Character} from './classes/character.js';
import {Player} from './classes/player.js';
import {Puzzle} from './classes/puzzle.js';
import {Inventory} from './classes/inventory.js';

function loadingProgress(loader,resources){
  let percent=Math.floor(PIXI.loader.progress);
  game.loadingText.text="Loading "+percent+ "%";
  //console.log(percent);
};

function loadConfigFiles(loader,resources){
  game.loadingText.visible=false;
  for(let i=0;i<game.files.length;i++){
    if(resources[game.files[i]].data==null){
      console.log("Error parsing JSON files")
    }else if(resources[game.files[i]].data.Scenes){
      let tempArray=game.scenesJSON.concat(resources[game.files[i]].data.Scenes);
      game.scenesJSON=tempArray;
    }else if(resources[game.files[i]].data.Objects){
      let tempArray=game.objectsJSON.concat(resources[game.files[i]].data.Objects);
      game.objectsJSON=tempArray;
    }else if(resources[game.files[i]].data.Characters){
      let tempArray=game.charactersJSON.concat(resources[game.files[i]].data.Characters);
      game.charactersJSON=tempArray;
    }else if(resources[game.files[i]].data.Puzzles){
      let tempArray=game.puzzlesJSON.concat(resources[game.files[i]].data.Puzzles);
      game.puzzlesJSON=tempArray;
    }else if(resources[game.files[i]].data.Settings){
      game.settings=resources[game.files[i]].data.Settings;
    }
  }

  PIXI.loader.reset();
  game.loadingText.visible=true;
  PIXI.loader.onProgress.add(loadingProgress);

  //Load Sounds
  let soundSrc=resources["sounds"].data.Sounds;
  for(let i=0;i<soundSrc.length;i++){
    let tmpSound=soundSrc[i].Src;
    if(tmpSound!="") PIXI.loader.add(soundSrc[i].Name,tmpSound);
  }

  //Load Player resources
  PIXI.loader.add('playerTex', resources["player"].data.Player.Texture)
  .add('playerJson', resources["player"].data.Player.Json)
  .add('playerSkeleton', resources["player"].data.Player.Skeleton);

  //Load Character resources
  let tempCharas=resources["characters"].data.Characters;
  for(let i=0;i<tempCharas.length;i++){
    PIXI.loader.add(tempCharas[i].name+"Tex", tempCharas[i].Texture)
    .add(tempCharas[i].name+'Json', tempCharas[i].Json)
    .add(tempCharas[i].name+'Skeleton', tempCharas[i].Skeleton);
  }

  PIXI.loader.load(buildGame);
};

function buildGame(loader,resources){
  game.loadingText.destroy();
  game.resources=resources;
  //Build Player
  game.player=new Player("Armature");
  game.app.stage.addChild(game.player.sprite);

  //Build inventory
  game.inventory=new Inventory();
  game.app.stage.addChild(game.inventory.container);
  game.app.stage.addChild(game.inventory.icon);
  game.inventory.setIcon(game.settings.Inventory); //Create settings.json to change pos

  //Build objects
  for(let i=0;i<game.objectsJSON.length;i++){
    game.objects[i]=new gameObject(game.objectsJSON[i],i);
  }

  //Build puzzles
  for(let i=0;i<game.puzzlesJSON.length;i++){
    game.puzzles[i]=new Puzzle(game.puzzlesJSON[i],i);
  }

  //Build characters
  for(let i=0;i<game.charactersJSON.length;i++){
    game.characters[i]=new Character(game.charactersJSON[i],i);
  }

  //Build Logo and Main screens
  game.logoScreen=new LogoScreen();
  game.titleScreen=new TitleScreen();

  //Build Scenes
  for(let i=0;i<game.scenesJSON.length;i++){
    game.scenes[i]=new gameScene(game.scenesJSON[i],i);
    game.app.stage.addChild(game.scenes[i].container);
  }
  //Add texts
  game.app.stage.addChild(game.playerText);
  PIXI.loader.reset();
  game.ticker=new PIXI.ticker.Ticker();
  game.ticker.add(deltaTime=>game.loop(deltaTime));
  game.ticker.start();
  game.start();
};

export {
  loadingProgress,
  loadConfigFiles
};
