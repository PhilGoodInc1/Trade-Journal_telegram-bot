import {WizardContext} from "telegraf/typings/scenes";
import {uploadStatsForPeriod} from "../sql/sqlUploadStats";
import {resultsData} from "./newTrade";
const { Composer, Scenes, Markup} = require('telegraf');


const startStep = new Composer();
startStep.on('text', async (ctx: TBotContext) => {
    ctx.wizard.state.data = {} as periodStatsDataType;
    await ctx.reply('Введите дату начала периода за который вы хотите получить статистику(YYYY-MM-DD)');
    return ctx.wizard.next()
});

const endPeriodDateStep = new Composer();
endPeriodDateStep.on('text', async (ctx: TBotContext) => {
    //@ts-ignore
    ctx.wizard.state.data.startPeriodDate = ctx.message.text;
    await ctx.reply('Введите дату окончания периода за который вы хотите получить статистику(YYYY-MM-DD)');
    return ctx.wizard.next()
});

const checkDataStep = new Composer();
checkDataStep.on('text', async (ctx: TBotContext) => {
    //@ts-ignore
    ctx.wizard.state.data.endPeriodDate = ctx.message.text;
    let wizardData = ctx.wizard.state.data;
    await ctx.reply(`Хотите выгрузить статистику за период с ${wizardData.startPeriodDate} по ${wizardData.endPeriodDate}?`,
        Markup.inlineKeyboard([Markup.button.callback('Да, все верно', 'yes'), Markup.button.callback('Нет, хочу изменить даты', 'no')]).oneTime().resize());
    return ctx.wizard.next();
});

const submissionStep = new Composer();
submissionStep.action(['yes'], async (ctx: TBotContext) => {
    try {
        let returnResult = async (results: Array<resultsData>) => {
            let outcome = results.reduce(function (accumulator, trade) {
                return accumulator + trade.outcome;
            }, 0);
            await ctx.replyWithHTML(`<b>Количество сделок:</b> ${results.length} \n<b>Результат торговли за данный период:</b> ${outcome}`);
        };

        await ctx.answerCbQuery();
        let wizardData = ctx.wizard.state.data;
        uploadStatsForPeriod(wizardData, returnResult);

        return ctx.scene.leave();
    } catch (e) {
        console.log(e)
    }
});

submissionStep.action(['no'], async (ctx: TBotContext) => {
    try {
        await ctx.answerCbQuery();
        await ctx.reply('Выберите в меню пункт "Выгрузить статистику" еще раз');
        return ctx.scene.leave();
    } catch (e) {
        console.log(e)
    }
});


const uploadStatsScene = new Scenes.WizardScene('uploadStatsWizard', startStep, endPeriodDateStep, checkDataStep, submissionStep);

module.exports = uploadStatsScene;

export type periodStatsDataType = {
    startPeriodDate: string,
    endPeriodDate: string
}

type ContextStateType = {
    wizard: {
        state: {
            data: periodStatsDataType
        }
    }
};



type TBotContext = WizardContext & ContextStateType;