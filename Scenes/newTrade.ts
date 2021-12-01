import {WizardContext} from "telegraf/typings/scenes";
import {insertNewTrade} from "../sql/sqlAddPost";

const {Markup, Composer, Scenes} = require('telegraf');


const startStep = new Composer();
startStep.on('text', async (ctx: TBotContext) => {
    try {
        ctx.wizard.state.data = {} as tradeDataType;
        await ctx.reply('Тиккер инструмента');
        return ctx.wizard.next();
    } catch (e) {
        console.log(e);
    }
});

const priceStep = new Composer();
priceStep.on('text', async (ctx: TBotContext) => {
    try {
        //TODO check how to fix message.text in ts
        //@ts-ignore
        ctx.wizard.state.data.ticker = ctx.message.text;
        await ctx.reply('Цена входа');
        return ctx.wizard.next();
    } catch (e) {
        console.log(e);
    }
});

const volumeStep = new Composer();
volumeStep.on('text', async (ctx: TBotContext) => {
    try {
        //TODO check how to fix message.text in ts
        //@ts-ignore
        ctx.wizard.state.data.price = Number(ctx.message.text);
        await ctx.reply('Объем позиции');
        return ctx.wizard.next();
    } catch (e) {
        console.log(e);
    }
});

const positionStep = new Composer();
positionStep.on('text', async (ctx: TBotContext) => {
    try {
        //@ts-ignore
        ctx.wizard.state.data.volume = Number(ctx.message.text);
        await ctx.reply('Позиция',
            Markup.inlineKeyboard([Markup.button.callback('Long(Покупка)', 'long'), Markup.button.callback('Short(Продажа)', 'short')]).oneTime().resize());
        return ctx.wizard.next();
    } catch (e) {
        console.log(e)
    }
});

const dateStep = new Composer();

dateStep.action(['long', 'short'], async (ctx: TBotContext) => {
    try {
        await ctx.answerCbQuery();
        //@ts-ignore
        ctx.wizard.state.data.position = ctx.update.callback_query.data;
        await ctx.reply('Дата сделки(YYYY-MM-DD)');
        return ctx.wizard.next();
    } catch (e) {
        console.log(e)
    }
});

const reasonStep = new Composer();
reasonStep.on('text', async (ctx: TBotContext) => {
    try {
        //@ts-ignore
        ctx.wizard.state.data.date = ctx.message.text;
        await ctx.reply('Причина входа в сделку',
            Markup.inlineKeyboard([Markup.button.callback('Пробой уровня', 'пробой'), Markup.button.callback('Отбой от уровня', 'отбой')]).oneTime().resize());
        return ctx.wizard.next();
    } catch (e) {
        console.log(e);
    }
});

const outcomeStep = new Composer();
outcomeStep.action(['пробой', 'отбой'], async (ctx: TBotContext) => {
    try {
        await ctx.answerCbQuery();
        //@ts-ignore
        ctx.wizard.state.data.reason = ctx.update.callback_query.data;
        await ctx.reply('Итог сделки');
        return ctx.wizard.next();
    } catch (e) {
        console.log(e);
    }
});

const noteStep = new Composer();
noteStep.on('text', async (ctx: TBotContext) => {
    try {
        //@ts-ignore
        ctx.wizard.state.data.outcome = Number(ctx.message.text);
        console.log(ctx.wizard.state);
        await ctx.reply('Заметка');
        return ctx.wizard.next();
    } catch (e) {
        console.log(e);
    }
});

const checkStep = new Composer();
checkStep.on('text', async (ctx: TBotContext) => {
    try {
        //@ts-ignore
        ctx.wizard.state.data.note = ctx.message.text;
        const wizardData = ctx.wizard.state.data;
        console.log(ctx.wizard.state);
        await ctx.replyWithHTML(`<b>Ваша сделка:</b> 
\n <i>Тиккер</i>: ${wizardData.ticker} \n <i>Позиция:</i> ${wizardData.position} \n <i>Цена входа:</i> ${wizardData.price} \n <i>Объем:</i> ${wizardData.volume} \n <i>Дата открытия:</i> ${wizardData.date} \n <i>Причина входа:</> ${wizardData.reason} \n <i>Профит/убыток:</> ${wizardData.outcome} \n <i>Заметка:</i> ${wizardData.note}`);
        await ctx.reply('Проверьте данные. Все верно?',
            Markup.inlineKeyboard([Markup.button.callback('Да', 'yes'), Markup.button.callback('Нет', 'no')]).oneTime().resize());
        return ctx.wizard.next();
    } catch (e) {
        console.log(e);
    }
});

const submissionStep = new Composer();
submissionStep.action(['yes'], async (ctx: TBotContext) => {
    try {
        await ctx.answerCbQuery();
        const wizardData = ctx.wizard.state.data;
        await insertNewTrade(wizardData);
        await ctx.reply("Сделка успешно сохранена!");
        return ctx.scene.leave();
    } catch (e) {
        console.log(e)
    }
});

submissionStep.action(['no'], async (ctx: TBotContext) => {
    try {
        await ctx.answerCbQuery();
        await ctx.reply('Введите данные еще раз, выбрав в меню "Новая сделка"');
        return ctx.scene.leave();
    } catch (e) {
        console.log(e)
    }
});




const newTradeScene = new Scenes.WizardScene('newTradeWizard', startStep, priceStep, volumeStep, positionStep, dateStep, reasonStep, outcomeStep, noteStep, checkStep, submissionStep);

module.exports = newTradeScene;


type ContextStateType = {
    wizard: {
        state: {
            data: tradeDataType
        }
    }
};

export interface tradeDataType  {
    ticker: string,
    price: number,
    volume: number,
    position: 'long' | 'short',
    date: string,
    reason: 'пробой' | 'отбой',
    outcome: number,
    note: string,
}

export interface resultsData extends tradeDataType {
    id: number
}

type TBotContext = WizardContext & ContextStateType;