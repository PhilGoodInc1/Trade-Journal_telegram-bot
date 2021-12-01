import {Context, Scenes} from "telegraf";


const {Telegraf, Markup,  session} = require('telegraf');
const config = require('config');
export const bot = new Telegraf(config.get('token'));
const uploadStatsScene = require('./Scenes/uploadStats');
const newTradeScene = require('./Scenes/newTrade');



const stage = new Scenes.Stage([newTradeScene, uploadStatsScene]);
bot.use(session());
bot.use(stage.middleware());

bot.hears('Новая сделка', (ctx: any) => ctx.scene.enter('newTradeWizard'));
bot.hears('Выгрузить статистику', (ctx: any) => ctx.scene.enter('uploadStatsWizard'));

bot.start(async (ctx: Context) => {
    try {
        await ctx.reply('Выберите дальнешие действия:',
            Markup.keyboard([['Новая сделка', 'Выгрузить статистику']]).oneTime().resize())
    } catch (e) {
        console.log(e)
    }
});


bot.launch();