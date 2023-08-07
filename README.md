# gpt-json

gpt-json is a library that enables interaction with OpenAI's GPT models using JSON and supports schema validation with yup. You can execute requests to retrieve specific information and get a validated result back.

## Features

- Schema defination and validation
- Message parsing
- Streaming support

# Getting started

## Install

```bash
npm install gpt-json yup
```

## Usage

### Initialization

```ts
import GPTJSON from 'gpt-json';
import { object, number } from 'yup';

const client = new GPTJSON({
  apiKey: 'YOUR_OPENAI_API_KEY', // Your OpenAI API key
});
```

### Non-streamed request

```ts
const response = await client.executeRequest({
  model: 'gpt-4', // OpenAI's model
  request: 'Give me some basic data about Estonia', // Your request that targets the GPT API
  schema: object({
    population: number(),
    area: number().meta({ description: 'Area in square kilometers' }), // Use descriptions to get more consistent responses. E.g. you can define the unit of measure to prevent metric/imperial system issues.
  }),
});

// Response:
// {
//    population: 1331000
//    area: 45339
// }
```

### Streamed request

```ts
const response = await client.executeStreamRequest({
  model: 'gpt-4',
  request: 'Top 5 tallest mountains of the world',
  schema: array(
    object({
      height: number().required(),
      name: string().required(),
    })
  ),
  // It is only called when the data can be validated with the defined schema
  onUpdate: data => {
    console.log(data);
    // Iteration 1: []
    // Iteration 2: [{ height: 8848, name: 'Mount Everest' }]
    // Iteration 3: [{ height: 8848, name: 'Mount Everest' }, { height: 8611, name: 'K2' }]
    // etc.
  },
});

// Response:
// [
//   { height: 8848, name: 'Mount Everest' },
//   { height: 8611, name: 'K2' },
//   { height: 8586, name: 'Kangchenjunga' },
//   { height: 8516, name: 'Lhotse' },
//   { height: 8462, name: 'Makalu' },
// ];
```

## License

[This package](https://github.com/KLaci/gpt-json/blob/main/LICENSE) is licenced under the MIT licence.
