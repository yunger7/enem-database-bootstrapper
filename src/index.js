import { createWriteStream } from 'node:fs';
import { delay, sqlValueOrNull } from './utils.js';

const getExamQuestions = async (year, offset = 0, result = []) => {
    const searchParams = new URLSearchParams({
        limit: 50,
        offset,
    });

    const response = await fetch(`https://api.enem.dev/v1/exams/${year}/questions?${searchParams.toString()}`);
    const responseJson = await response.json();

    if (!responseJson.metadata) {
        console.log(responseJson);
        process.exit(1);
    }

    const { metadata, questions } = responseJson;

    await delay(1000);

    if (metadata.hasMore) {
        return getExamQuestions(year, metadata.offset + metadata.limit, result.concat(questions));
    }

    return result.concat(questions);
}

async function main() {
    const stream = createWriteStream('./data/bootstrap-enem-data.sql');

    console.log('Fetching exams data');

    const examsResponse = await fetch(`https://api.enem.dev/v1/exams`);
    const exams = await examsResponse.json();

    await delay(1000);

    for (let i = 0; i < exams.length; i++) {
        const exam = exams[i];

        stream.write(`INSERT INTO enem_exams.exams (title, year) VALUES ('${exam.title}', ${exam.year});\n\n`);

        console.log(`[${i + 1}/${exams.length}]: Fetching exam details for "${exam.title}"`);

        const questions = await getExamQuestions(exam.year);

        await delay(1000);

        for (const question of questions) {
            stream.write(`
                INSERT INTO enem_exams.questions (
                    title,
                    year,
                    question_number,
                    discipline,
                    language,
                    context,
                    files,
                    correct_alternative
                ) 
                VALUES (
                    ${sqlValueOrNull(question.title)},
                    ${exam.year},
                    ${question.index},
                    ${sqlValueOrNull(question.discipline)},
                    ${sqlValueOrNull(question.language)},
                    ${sqlValueOrNull(`${question.context || ''}\n\n${question.alternativesIntroduction || ''}`.trim())},
                    ${sqlValueOrNull(JSON.stringify(question.files))},
                    ${sqlValueOrNull(question.correctAlternative)}
                );`.trim() + '\n\n');

            stream.write('SET @last_question_id = LAST_INSERT_ID();\n\n');
            
            for (const alternative of question.alternatives) {
                stream.write(`
                    INSERT INTO enem_exams.alternatives (
                        question_id,
                        text,
                        is_correct,
                        file,
                        letter
                    ) 
                    VALUES (
                        @last_question_id,
                        ${sqlValueOrNull(alternative.text)},
                        ${alternative.isCorrect},
                        ${sqlValueOrNull(alternative.file)},
                        ${sqlValueOrNull(alternative.letter)}
                    );`.trim() + '\n\n');
            }
        }
    }

    stream.end();

    console.log('Done!');
}

main();
