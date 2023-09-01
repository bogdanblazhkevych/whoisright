import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const configuration = new Configuration({
    apiKey: process.env.API_KEY,
});

const openai = new OpenAIApi(configuration);

const getMediatorResponse = async (messages) => {
    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages,
    });

    console.log("messages argument within mediator module: ", messages)

    return completion.data.choices[0].message.content ?? null
}

function mediatorFunctions() {
    return Object.freeze({
        getMediatorResponse
    })
}

const mediator = mediatorFunctions();
export default mediator;

export { getMediatorResponse }