# gpt-json

gpt-json is a library that enables interaction with OpenAI's GPT models using JSON and supports schema validation with yup. You can execute requests to retrieve specific information and get a validated result back.

## Upcoming features

- Streaming
- Multi message support
- Schema labeling

# Getting started

## Install

```bash
npm install gpt-json
```

## Usage

```ts
import GPTJSON from 'gpt-json';
import { object, number } from 'yup';

const client = new GPTJSON({
  apiKey: 'YOUR_OPENAI_API_KEY',
});

const response = await client.executeRequest({
  model: 'gpt-4',
  request: 'Give me basic data about Estonia',
  schema: object({
    population: number(),
    area: number().meta({ description: 'Area in square meters' }),
  }),
});

//=> 'hello from my package'
```
