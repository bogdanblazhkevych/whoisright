import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const configuration = new Configuration({
    apiKey: process.env.API_KEY,
});

const openai = new OpenAIApi(configuration);

const getMediatorResponse = async (messages) => {
    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: messages,
        })
        return completion.data.choices[0].message.content
    } catch (err) {
        throw new Error("failed to get mediator response")
    }
}

function mediatorFunctions() {
    return Object.freeze({
        getMediatorResponse
    })
}

const mediator = mediatorFunctions();
export default mediator;

export { getMediatorResponse }