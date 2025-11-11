import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { Disease } from './models/Disease.js';
import { Symptom } from './models/Symptom.js';
import { Question } from './models/Question.js';
import { Answer } from './models/Answer.js';
dotenv.config();
// Two main categories: General Bio Data and Symptoms
const categories = [
    {
        name: 'General Bio Data',
        description: 'Basic physical and demographic information',
        questions: [
            { name: 'age', question_text: 'What is your age?', question_type: 'text' },
            { name: 'gender', question_text: 'What is your gender?', question_type: 'radio', options: ['Male', 'Female'] },
            { name: 'height', question_text: 'What is your height? (in cm)', question_type: 'text' },
            { name: 'weight', question_text: 'What is your weight? (in kg)', question_type: 'text' }
        ]
    },
    {
        name: 'Urination Patterns',
        description: 'Changes in urination frequency and patterns',
        questions: [
            { name: 'polyuria', question_text: 'Do you experience frequent urination (polyuria)?', question_type: 'radio', options: ['Yes', 'No'] }
        ]
    },
    {
        name: 'Thirst and Hydration',
        description: 'Changes in thirst and fluid intake',
        questions: [
            { name: 'polydipsia', question_text: 'Do you experience excessive thirst (polydipsia)?', question_type: 'radio', options: ['Yes', 'No'] }
        ]
    },
    {
        name: 'Weight Changes',
        description: 'Unexplained changes in body weight',
        questions: [
            { name: 'sudden_weight_loss', question_text: 'Have you experienced sudden weight loss?', question_type: 'radio', options: ['Yes', 'No'] }
        ]
    },
    {
        name: 'Energy Levels',
        description: 'Changes in energy and fatigue',
        questions: [
            { name: 'weakness', question_text: 'Do you feel unusually weak or fatigued?', question_type: 'radio', options: ['Yes', 'No'] }
        ]
    },
    {
        name: 'Appetite Changes',
        description: 'Changes in hunger and eating patterns',
        questions: [
            { name: 'polyphagia', question_text: 'Do you feel increased hunger (polyphagia)?', question_type: 'radio', options: ['Yes', 'No'] }
        ]
    },
    {
        name: 'Infections',
        description: 'Presence of recurring infections',
        questions: [
            { name: 'genital_thrush', question_text: 'Have you noticed any genital yeast infections?', question_type: 'radio', options: ['Yes', 'No'] }
        ]
    },
    {
        name: 'Vision Changes',
        description: 'Changes in visual acuity',
        questions: [
            { name: 'visual_blurring', question_text: 'Do you experience blurred vision?', question_type: 'radio', options: ['Yes', 'No'] }
        ]
    },
    {
        name: 'Skin Changes',
        description: 'Changes in skin condition',
        questions: [
            { name: 'itching', question_text: 'Do you have persistent itching?', question_type: 'radio', options: ['Yes', 'No'] }
        ]
    },
    {
        name: 'Mood Changes',
        description: 'Changes in mood and behavior',
        questions: [
            { name: 'irritability', question_text: 'Do you feel more irritable than usual?', question_type: 'radio', options: ['Yes', 'No'] }
        ]
    },
    {
        name: 'Wound Healing',
        description: 'Changes in wound healing time',
        questions: [
            { name: 'delayed_healing', question_text: 'Do your wounds take longer to heal than usual?', question_type: 'radio', options: ['Yes', 'No'] }
        ]
    },
    {
        name: 'Muscle Conditions',
        description: 'Changes in muscle strength and condition',
        questions: [
            { name: 'partial_paresis', question_text: 'Do you experience muscle weakness?', question_type: 'radio', options: ['Yes', 'No'] },
            { name: 'muscle_stiffness', question_text: 'Do you experience muscle stiffness?', question_type: 'radio', options: ['Yes', 'No'] }
        ]
    },
    {
        name: 'Hair Conditions',
        description: 'Changes in hair growth patterns',
        questions: [
            { name: 'alopecia', question_text: 'Have you noticed unusual hair loss?', question_type: 'radio', options: ['Yes', 'No'] }
        ]
    }
];
const seedData = async () => {
    try {
        await connectDB();
        console.log('Connected to database');
        // Clear all collections first
        console.log('Clearing existing collections...');
        await Disease.deleteMany({});
        await Symptom.deleteMany({});
        await Question.deleteMany({});
        await Answer.deleteMany({});
        console.log('All collections cleared successfully');
        // Create Diabetes disease
        const diabetes = new Disease({
            name: 'Diabetes',
            description: 'A chronic condition that affects how your body processes blood sugar (glucose)',
            symptoms_description: 'Common symptoms that may indicate diabetes risk'
        });
        await diabetes.save();
        console.log('Created Diabetes disease');
        // Create categories and their questions
        for (const category of categories) {
            const symptom = new Symptom({
                name: category.name,
                description: category.description,
                disease_id: diabetes._id
            });
            await symptom.save();
            console.log(`Created category: ${category.name}`);

            // Create questions for this category
            for (const questionData of category.questions) {
                const question = new Question({
                    question_text: questionData.question_text,
                    question_type: questionData.question_type,
                    symptom_id: symptom._id,
                    options: questionData.options || []
                });
                await question.save();
                console.log(`Created question: ${questionData.name} for ${category.name}`);
            }
        }
        console.log('Database seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};
// Run the seeding function
seedData();
