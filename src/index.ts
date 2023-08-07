import { Configuration, OpenAIApi } from 'openai';
import {
  ArraySchema,
  ObjectSchema,
  SchemaFieldDescription,
  SchemaInnerTypeDescription,
  SchemaObjectDescription,
} from 'yup';

export interface GPTJSONOptions {
  apiKey: string;
}

export interface GPTJSONRequest {
  model: string;
  request: string;
  schema: ObjectSchema<any> | ArraySchema<any, any, any, any>;
}

function indentation(depth: number): string {
  return '  '.repeat(depth);
}

function objectSchemaDescription(
  schema: SchemaObjectDescription,
  depth: number
): string {
  const serializedDescription = `${indentation(depth)}{
${Object.entries(schema.fields)
  .map(([f, d]) => fieldSchemaDescription(f, d, depth + 1))
  .join('\n')}
${indentation(depth)}}`;

  return serializedDescription;
}

function arraySchemaDescription(
  schema: SchemaObjectDescription,
  depth: number
): string {
  const arraySchema = schema as SchemaInnerTypeDescription;

  const serializedDescription = `${indentation(depth)}[
${innerSchemaDescription(arraySchema.innerType as any, depth + 1)}
${indentation(depth)}]`;

  return serializedDescription;
}

function fieldSchemaDescription(
  fieldName: string,
  fieldSchemaDescription: SchemaFieldDescription,
  depth: number
): string {
  const fieldSchema = fieldSchemaDescription as any;
  const serializedDescription = `${indentation(
    depth
  )}${fieldName}: ${innerSchemaDescription(fieldSchema, depth + 1)}${
    fieldSchema?.meta?.description
      ? ` // ${fieldSchema?.meta?.description}`
      : ''
  }`;

  return serializedDescription;
}

function innerSchemaDescription(
  schema: SchemaObjectDescription,
  depth: number
): string {
  if (schema.type === 'object') {
    return objectSchemaDescription(schema, depth);
  } else if (schema.type === 'array') {
    return arraySchemaDescription(schema, depth);
  }

  return schema.type;
}

export function generateSchemaDescription(schema: ObjectSchema<any>): string {
  const describedSchema = schema.describe();

  const depth = 0;
  const serializedDescription = innerSchemaDescription(describedSchema, depth);

  return serializedDescription;
}

class GPTJSON {
  private apiKey: string;

  constructor({ apiKey }: GPTJSONOptions) {
    this.apiKey = apiKey;
  }

  async executeRequest({
    model,
    request,
    schema,
  }: GPTJSONRequest): Promise<Record<string, unknown>> {
    const config = new Configuration({
      apiKey: this.apiKey,
    });

    const openai = new OpenAIApi(config);

    const response = await openai.createChatCompletion({
      model: model,
      messages: [
        {
          role: 'user',
          content: `${request}
      Do not include any explanations, only provide a  RFC8259 compliant JSON response following this format without deviation.
      ${generateSchemaDescription(schema as any)}`,
        },
      ],
    });

    const respMessage =
      response.data.choices?.[0]?.message?.content?.trim() ?? '';

    if (respMessage === '') {
      throw new Error('No response from OpenAI');
    }

    const parsedResponse = JSON.parse(respMessage);

    const isValid = await schema.isValid(parsedResponse);

    if (!isValid) {
      throw new Error('Invalid response from OpenAI');
    }

    return parsedResponse;
  }
}

export default GPTJSON;
