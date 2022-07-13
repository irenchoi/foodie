require('dotenv').config();

var SpoonacularApi = require('spoonacular_api');
const request = require('request');
var api = new SpoonacularApi.DefaultApi();

const {Client,MessageEmbed} = require("discord.js")
let err = 1 //initially i assume theres no errors
const client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });
const PREFIX = "$"
client.login(process.env.TOKEN_CODE);
let apikey = "e122f4c9a6774335887c20655c9a0f48"
let state = 0 //0: search for food, 1: search for specific item number
let arr = []
client.on('ready', () => {
    console.log("The bot has logged in.")
});
function make_request(url, option) {
    let options = {json: true};
    let ans = "bad answer!"
    
    console.log(ans);
    return ans;

}
function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
           !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }
client.on('message', (message) => {
    if (message.author.bot) return;
    //console.log(`[${message.author.tag}]: ${message.content}`);
    if (message.content === "hello"){
        message.reply("hello there!");
    }

    if (message.content.startsWith(PREFIX)){
        const [CMD_NAME, ...args] = message.content
            .trim()
            .substring(PREFIX.length)
            .split(/\s+/);
        console.log(CMD_NAME);
        console.log(args);
        let keyword = args.join('');
        console.log(keyword);
            if (CMD_NAME === "help"){
                const helpEmbed = new MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle('Help')
                    .setDescription('Use Foodie to learn more about the menu\'s recipe, nutrition information, and the taste!')
                    .addFields(
                        { name: 'How to use Foodie:', value: 'Call Foodie by prefixing $recipe, and the menu of the item you would like to know more about. ' },
                        { name: '\u200B', value: '\u200B' },
                    )
            }
            if (CMD_NAME === "recipe"){
                if (isNumeric(keyword)) {
                    let q = Number(keyword)
                    if (q > arr.length) {
                        message.channel.send("invalid query stop being gay")
                    }
                    else {
                        let food_id = arr[q-1].id
                        let nutrition_url = `https://api.spoonacular.com/recipes/${food_id}/nutritionWidget.json?apiKey=${apikey}`
                        let options = {json: true};
                        request(nutrition_url, options, (error, res, body) => {
                        if (error) {
                            console.log(error)
                            message.channel.send("error")
                        }
                        else {
                            // let obj = JSON.parse(body)
                            // console.log(body.results)
                            let obj = body
                            let recipe = "recipe"
                            request(`https://api.spoonacular.com/recipes/${food_id}/summary?apiKey=e122f4c9a6774335887c20655c9a0f48`, options, (error, res, body_recipe) => {
                                if (error) {
                                    console.log(error)
                                } 
                                else {
                                    request(`https://api.spoonacular.com/recipes/${food_id}/tasteWidget.json?apiKey=e122f4c9a6774335887c20655c9a0f48`,options,(error,res,body_taste) => {
                                        if (error) {
                                            console.log("taste url error")
                                        }
                                        else {
                                            taste = body_taste;
                                            recipe = body_recipe.summary;
                                            var regex = /(<([^>]+)>)/ig
                                            ,   gayshit = recipe
                                            ,   recipe = gayshit.replace(regex, "");
                                            const exampleEmbed = new MessageEmbed()
                                    .setColor('#0099ff')
                                    .setTitle(arr[q-1].title)
                                    .setAuthor({ name: 'Irene Choi', iconURL: arr[q-1].image })
                                    .setDescription(`Displaying food item: ${arr[q-1].title}`)
                                    .setThumbnail(arr[q-1].image)
                                    .addFields(
                                        { name: 'Summarized Recipe:', value: recipe.slice(0,1020) },
                                        { name: '\u200B', value: '\u200B' },
                                        { name: 'Nutirition Facts', value: `Calories: ${body.calories}cal\n Carbs: ${body.carbs}\n Fat: ${body.fat}\n Protein: ${body.protein}`, inline: true },
                                        { name: 'Taste', value: `Sweetness: ${body_taste.sweetness}\n Saltiness: ${body_taste.saltiness}\n Sourness: ${body_taste.sourness}\n Bitterness: ${body_taste.bitterness}`, inline: true },
                                        )
                                        //.addField('Inline field title', 'Some value here', true)
                                        .setImage(arr[q-1].image)
                                        .setTimestamp()
                                        .setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });
                                        message.channel.send({ embeds: [exampleEmbed] });
    
                                        }
                                    })
                                }
                            });
                            console.log(recipe)
                            
                        }
                    })  
                 }
                    state = 0
                }
                else {
                    let url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=e122f4c9a6774335887c20655c9a0f48&query=${keyword}`
                    let options = {json: true};
                    request(url, options, (error, res, body_food) => {
                        if (error) {
                            err = 0;
                            console.log(error)
                            message.channel.send("fuck errors")
                        };
                        
                        if (!error) {
                            // let obj = JSON.parse(body)
                            console.log("This is gay!")
                            console.log(body_food)
                            arr = body_food.results
                            if (!arr) { //error here
                                err = 0; //err is 0 which means theres an error
                                message.channel.send(`We have an issue! Points: ${body_food.code}`)
                                message.channel.send(`${body_food.message}`)
                                return;
                            }
                            let str = ""
                            for (let i = 0; i<arr.length; i++) {
                                str += (i+1).toString()
                                str += ": "
                                str += arr[i].title
                                str += "\n"
                            }
                            if (str === "") {
                                err = 0;
                                message.channel.send("sorry no food items found!")
                            }
                            else {
                                message.channel.send(str)
                            }
                            
    
                        };
                    }); 
                    if (!err) { //if error is non zero
                        message.channel.send("Which menu's recipe would you like to view?");
                    }
                    state = 1
                }
                
                

            }
    }

});
