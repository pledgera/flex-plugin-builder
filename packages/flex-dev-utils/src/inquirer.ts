import inquirer, { Question as IQuestion } from 'inquirer';
import { validateConfirmation } from './validators';

export type YNAnswer = 'Y' | 'N';
export const positiveAnswers = ['y', 'yes'];
export const negativeAnswers = ['n', 'no'];
export const acceptableAnswers = positiveAnswers.concat(negativeAnswers);

export interface Question {
  name: string;
  message: string;
  type?: 'list' | 'input' | 'password';
  validate?(input: string): boolean | string | Promise<boolean | string>;
}

/**
 * Prompts the user to answer the question. Upon validation, returns the answer.
 *
 * @param question  the question to prompt the user with
 */
export const prompt = async (question: Question): Promise<Question['name']> => {
  question.type = question.type || 'input';

  const result = await inquirer.prompt([question as IQuestion]);
  const nameKey = Object.keys(question).find((k) => k === 'name') as string;

  return result[question[nameKey]];
};

/**
 * Provides a confirmation prompt. The response is a Promise<boolean> with `true` resolving to
 * successful confirmation, and `false` being the rejected confirmation
 *
 * @param question      the question to ask
 * @param defaultAnswer the default answer, can be Y or N
 */
export const confirm = async (question: string, defaultAnswer?: YNAnswer): Promise<boolean> => {
  let suffix = '(yn)';
  if (defaultAnswer === 'Y') {
    suffix = '(Yn)';
  } else if (defaultAnswer === 'N') {
    suffix = '(yN)';
  }

  const q: Question = {
    name: 'answer',
    message: `${question.trim()} ${suffix}`,
    validate: validateConfirmation(defaultAnswer),
  };

  let answer = await prompt(q);
  if (!answer && defaultAnswer) {
    answer = defaultAnswer;
  }

  if (positiveAnswers.includes(answer.toLowerCase())) {
    return Promise.resolve(true);
  }

  return Promise.resolve(false);
};

/**
 * Prompts the user to select from one of the choices.
 *
 * @param question  the question to prompt the user with
 * @param choices   the list of options
 */
export const choose = async (question: Question, choices: string[]): Promise<Question['name']> => {
  question.type = 'list';

  return prompt(Object.assign(question, {choices}));
};

export default inquirer;
