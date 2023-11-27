import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
require('dotenv').config();
import * as cron from 'node-cron';

import { UserModel, addUserToDB, removeUserFromDB } from './database';
import { generatePortfolioMessage } from './stocks';

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

async function sendMessage(chat_id: number, text: string): Promise<void> {
    const data = {
        chat_id,
        text,
    };

    const apiUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`;

    try {
        const response = await axios.post(apiUrl, data);
        console.log('Message sent: ', response.data);
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            console.error('Error sending message:', error.response.data);
        } else {
            console.error('Error sending message:', error);
        }
    }
}

//Replies with relevant message to all the avialble user commands 
async function replyToCommand(user_id: number, message: string, chat_id: number): Promise<void> {
    let text = '';

    const isSubscribed = await UserModel.exists({ user_id });

    switch (message) {
        case '/start':
            text = `Welcome to PortfolioFather by Investmint! \n🚀 Use \`/subscribe\` to receive daily updates of your portfolio. \n🛑 Use \`/unsubscribe\` to stop receiving updates. \n\nHappy investing! 📈
            `;
            break;
        case '/subscribe':
            if (isSubscribed) {
                text = 'You are already subscribed. No need to subscribe again. 👍';
            } else {
                await addUserToDB(user_id);
                text = 'You have been subscribed! You will now receive daily updates. 👍';
            }
            break;
        case '/unsubscribe':
            if (isSubscribed) {
                await removeUserFromDB(user_id);
                text = 'You have been unsubscribed! You will no longer receive updates. 👍';
            } else {
                text = "You're not subscribed. No need to unsubscribe. 👍";
            }
            break;
        default:
            text = '❎ This is not a valid command!';
            break;
    }

    await sendMessage(chat_id, text);
}

// Generates and sends the portfolio message to all the subcribed users.
const sendPortfolioUpdatesToAllUsers = async (): Promise<void> => {
    try {
        const users = await UserModel.find({});
        const portfolioMessage = await generatePortfolioMessage();

        for (const user of users) {
            const user_id = user.user_id;
            await sendMessage(user_id, portfolioMessage);
        }

        console.log('Portfolio updates sent to all users.');
    } catch (error) {
        console.error('Error sending portfolio updates:', error);
    }
};

cron.schedule('0 16 * * *', async () => {
    console.log('Running portfolio update task...');
    await sendPortfolioUpdatesToAllUsers();
}, {
    timezone: 'Asia/Kolkata'
});


app.all('*', async (req: Request, res: Response) => {
    const { method } = req;
    switch (method) {
        case 'POST':
            try {
                const timestamp = new Date().toISOString();
                console.log(`Timestamp: ${timestamp}`);
                console.log(req.body);

                const chat_id = req.body.message.chat.id;
                const user_id = req.body.message.from.id;
                const message = req.body.message.text;

                await replyToCommand(user_id, message, chat_id);
                res.status(200).send({ ok: true });
            } catch (error) {
                console.error(error);
                res.status(500).send({ ok: false, error: 'Internal Server Error' });
            }
            break;
        case 'GET':
            res.send('You are not supposed to be here!');
            break;
        default:
            res.status(405).send('Method Not Allowed');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});