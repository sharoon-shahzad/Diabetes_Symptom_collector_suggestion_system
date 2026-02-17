import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { Disease } from './models/Disease.js';
import { Symptom } from './models/Symptom.js';
import { Question } from './models/Question.js';
import { Answer } from './models/Answer.js';
dotenv.config();

const categories = [
    {
        name: 'General Bio Data',
        description: 'BASIC INFORMATION\n\nWhy We Ask:\n\n• Height & Weight - Calculate BMI (key risk indicator)\n\nQuick Tip:\nBeing overweight increases risk, but sudden weight loss can also signal diabetes.\n\nNote: Age and gender are already collected from your account profile.\n\nAll data is confidential and used only for your assessment.',
        questions: [
            { 
                name: 'height', 
                question_text: 'What is your height?', 
                question_type: 'text',
                render_config: {
                    type: 'unit_conversion',
                    config: {
                        from_units: [
                            { name: 'feet', type: 'dropdown', options: [3, 4, 5, 6, 7, 8], label: 'Feet' },
                            { name: 'inches', type: 'dropdown', options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], label: 'Inches' }
                        ],
                        to_unit: 'cm',
                        formula: '(feet * 30.48) + (inches * 2.54)',
                        display_format: '{feet} ft {inches} in'
                    }
                },
                ml_feature_mapping: {
                    feature_name: 'height_cm',
                    transformation: 'unit_conversion',
                    is_required: true,
                    default_value: 0
                }
            },
            { 
                name: 'weight', 
                question_text: 'What is your weight? (in kg)', 
                question_type: 'number',
                ml_feature_mapping: {
                    feature_name: 'weight_kg',
                    transformation: 'extract_first_number',
                    is_required: true,
                    default_value: 0
                }
            }
        ]
    },
    {
        name: 'Urination Patterns',
        description: 'FREQUENT URINATION (POLYURIA)\n\nWhat It Means:\nUrinating more than 7-8 times daily or waking up multiple times at night.\n\nWhy It Happens:\nHigh blood sugar causes kidneys to filter excess glucose, producing more urine.\n\nSigns to Watch:\n\n• Going to bathroom much more than usual\n• Waking 2-3+ times at night\n• Larger volumes each time\n• Planning day around bathroom access\n\nAnswer "Yes" if: Persistent pattern lasting days/weeks\nAnswer "No" if: Normal habits or just extra coffee/water',
        questions: [
            { 
                name: 'polyuria', 
                question_text: 'Do you experience frequent urination (polyuria)?', 
                question_type: 'radio', 
                options: ['Yes', 'No'],
                ml_feature_mapping: {
                    feature_name: 'Polyuria',
                    value_mapping: { 'Yes': 1, 'No': 0 },
                    is_required: true,
                    default_value: 0
                }
            }
        ]
    },
    {
        name: 'Thirst and Hydration',
        description: 'EXCESSIVE THIRST (POLYDIPSIA)\n\nWhat It Means:\nConstantly thirsty no matter how much you drink.\n\nThe Cycle:\nFrequent urination leads to dehydration, causing intense thirst, which makes you drink more and repeat the cycle.\n\nSigns to Watch:\n\n• Drinking 2-3x more than usual\n• Never feeling satisfied\n• Constant dry mouth\n• Always carrying water\n• Waking thirsty at night\n\nNormal vs Excessive:\n\nNormal - Thirst after exercise/salty food that drinking resolves\nExcessive - Persistent despite drinking plenty\n\nAnswer "Yes" if: Constantly seeking drinks, never satisfied',
        questions: [
            { 
                name: 'polydipsia', 
                question_text: 'Do you experience excessive thirst (polydipsia)?', 
                question_type: 'radio', 
                options: ['Yes', 'No'],
                ml_feature_mapping: {
                    feature_name: 'Polydipsia',
                    value_mapping: { 'Yes': 1, 'No': 0 },
                    is_required: true,
                    default_value: 0
                }
            }
        ]
    },
    {
        name: 'Weight Changes',
        description: 'UNEXPLAINED WEIGHT LOSS\n\nWhat It Means:\nLosing 5+ pounds without diet/exercise changes.\n\nWhy It Happens:\nCells can\'t use glucose for energy, so body burns fat and muscle instead.\n\nSigns to Watch:\n\n• Losing weight despite eating normally\n• Clothes fitting looser\n• Others commenting you look thinner\n• Weight loss over weeks/months\n• Accompanied by increased hunger\n\nKey Difference:\n\nIntentional - Actively dieting/exercising\nUnintentional - Happening despite normal eating\n\nAnswer "Yes" if: Unexpected weight loss without trying\nAnswer "No" if: Intentional weight loss or stable weight',
        questions: [
            { 
                name: 'sudden_weight_loss', 
                question_text: 'Have you experienced sudden weight loss?', 
                question_type: 'radio', 
                options: ['Yes', 'No'],
                ml_feature_mapping: {
                    feature_name: 'sudden weight loss',
                    value_mapping: { 'Yes': 1, 'No': 0 },
                    is_required: true,
                    default_value: 0
                }
            }
        ]
    },
    {
        name: 'Energy Levels',
        description: 'PERSISTENT FATIGUE\n\nWhat It Means:\nProfound exhaustion that doesn\'t improve with rest.\n\nWhy It Happens:\n\n• Cells starved of glucose (their fuel)\n• Dehydration from frequent urination\n• Poor sleep from nighttime bathroom trips\n• Blood sugar fluctuations\n\nSigns to Watch:\n\n• Exhausted even after sleeping\n• No energy for daily tasks\n• Needing frequent naps\n• Mental fog/difficulty concentrating\n• Simple tasks feel overwhelming\n\nNormal vs Diabetes Fatigue:\n\nNormal - Tired from busy day, resolved with rest\nDiabetes - Persistent, doesn\'t improve with sleep\n\nAnswer "Yes" if: Ongoing exhaustion affecting daily life',
        questions: [
            { 
                name: 'weakness', 
                question_text: 'Do you feel unusually weak or fatigued?', 
                question_type: 'radio', 
                options: ['Yes', 'No'],
                ml_feature_mapping: {
                    feature_name: 'weakness',
                    value_mapping: { 'Yes': 1, 'No': 0 },
                    is_required: true,
                    default_value: 0
                }
            }
        ]
    },
    {
        name: 'Appetite Changes',
        description: 'EXCESSIVE HUNGER (POLYPHAGIA)\n\nWhat It Means:\nFeeling very hungry even after eating full meals.\n\nThe Paradox:\nGlucose is in blood BUT cells can\'t access it, causing cells to starve and brain to signal hunger.\n\nSigns to Watch:\n\n• Hungry shortly after eating\n• Eating larger portions than usual\n• Never feeling satisfied\n• Increased cravings (especially carbs)\n• Eating more but possibly losing weight\n\nNormal vs Excessive:\n\nNormal - Hunger satisfied by meals for hours\nExcessive - Hungry again very soon after eating\n\nAnswer "Yes" if: Persistent excessive hunger that\'s unusual for you',
        questions: [
            { 
                name: 'polyphagia', 
                question_text: 'Do you feel increased hunger (polyphagia)?', 
                question_type: 'radio', 
                options: ['Yes', 'No'],
                ml_feature_mapping: {
                    feature_name: 'Polyphagia',
                    value_mapping: { 'Yes': 1, 'No': 0 },
                    is_required: true,
                    default_value: 0
                }
            }
        ]
    },
    {
        name: 'Infections',
        description: 'GENITAL YEAST INFECTIONS\n\nWhat It Means:\nRecurring fungal infections in the genital area.\n\nWhy It Happens:\nHigh blood sugar creates ideal environment for yeast growth.\n\nSymptoms:\n\nWomen:\n• Vaginal itching/burning\n• Thick white discharge\n• Pain during intercourse/urination\n\nMen:\n• Itching/irritation on penis\n• Redness/inflammation\n• Discharge or odor\n\nKey Pattern:\nRecurring infections (3-4+ per year) or difficult to treat\n\nAnswer "Yes" if: Frequent/recurring infections\nAnswer "No" if: None or isolated incident',
        questions: [
            { 
                name: 'genital_thrush', 
                question_text: 'Have you noticed any genital yeast infections?', 
                question_type: 'radio', 
                options: ['Yes', 'No'],
                ml_feature_mapping: {
                    feature_name: 'Genital thrush',
                    value_mapping: { 'Yes': 1, 'No': 0 },
                    is_required: true,
                    default_value: 0
                }
            }
        ]
    },
    {
        name: 'Vision Changes',
        description: 'BLURRED VISION\n\nWhat It Means:\nEyesight becomes fuzzy or unclear.\n\nWhy It Happens:\nHigh blood sugar causes fluid shifts in eye lens, changing how light focuses.\n\nSigns to Watch:\n\n• Difficulty reading/screens\n• Trouble seeing distance\n• Need to squint frequently\n• Vision fluctuates (better/worse at different times)\n• Difficulty focusing\n\nUnique Pattern:\nVision may improve/worsen as blood sugar changes throughout day.\n\nGood News:\nEarly vision changes often reverse with blood sugar control.\n\nAnswer "Yes" if: Blurry vision not explained by needing glasses\nAnswer "No" if: Vision normal or corrected with prescription',
        questions: [
            { 
                name: 'visual_blurring', 
                question_text: 'Do you experience blurred vision?', 
                question_type: 'radio', 
                options: ['Yes', 'No'],
                ml_feature_mapping: {
                    feature_name: 'visual blurring',
                    value_mapping: { 'Yes': 1, 'No': 0 },
                    is_required: true,
                    default_value: 0
                }
            }
        ]
    },
    {
        name: 'Skin Changes',
        description: 'PERSISTENT ITCHING\n\nWhat It Means:\nOngoing, bothersome itchiness affecting various body areas.\n\nWhy It Happens:\n\n• High blood sugar causes dry skin\n• Poor circulation to skin\n• Yeast infections in skin folds\n\nCommon Locations:\n• Legs and feet\n• Arms and hands\n• Skin folds (groin, under breasts)\n• Genital area\n\nSigns to Watch:\n\n• Itching lasting days/weeks\n• Very dry, flaky skin\n• Worse at night\n• Not relieved by regular moisturizers\n• Scratching provides only temporary relief\n\nAnswer "Yes" if: Ongoing itching without obvious external cause\nAnswer "No" if: Occasional, mild itching',
        questions: [
            { 
                name: 'itching', 
                question_text: 'Do you have persistent itching?', 
                question_type: 'radio', 
                options: ['Yes', 'No'],
                ml_feature_mapping: {
                    feature_name: 'Itching',
                    value_mapping: { 'Yes': 1, 'No': 0 },
                    is_required: true,
                    default_value: 0
                }
            }
        ]
    },
    {
        name: 'Mood Changes',
        description: 'INCREASED IRRITABILITY\n\nWhat It Means:\nFeeling unusually grumpy, short-tempered, or emotionally volatile.\n\nWhy It Happens:\n\n• Brain function affected by unstable blood sugar\n• Chronic fatigue reduces patience\n• Physical discomfort causes frustration\n• Stress hormones triggered\n\nSigns to Watch:\n\n• Snapping at people over small things\n• Constantly feeling on edge\n• Mood swings\n• Reduced stress tolerance\n• Others notice you\'re acting differently\n\nNormal vs Diabetes Mood:\n\nNormal - Occasional bad days, temporary\nDiabetes - Persistent change from typical personality\n\nAnswer "Yes" if: Noticeably more irritable than normal for you',
        questions: [
            { 
                name: 'irritability', 
                question_text: 'Do you feel more irritable than usual?', 
                question_type: 'radio', 
                options: ['Yes', 'No'],
                ml_feature_mapping: {
                    feature_name: 'Irritability',
                    value_mapping: { 'Yes': 1, 'No': 0 },
                    is_required: true,
                    default_value: 0
                }
            }
        ]
    },
    {
        name: 'Wound Healing',
        description: 'SLOW HEALING\n\nWhat It Means:\nCuts/scrapes taking weeks instead of days to heal.\n\nWhy It Happens:\n\n• Damaged blood vessels reduce blood flow\n• Weakened immune system\n• Higher infection risk\n\nSigns to Watch:\n\n• Small cuts taking weeks to close\n• Wounds becoming infected easily\n• Bruises lingering longer\n• Sores that won\'t heal (especially on feet)\n• Wounds reopening after seeming healed\n\nNormal Timeline:\nSmall cut heals in 5-7 days\n\nDelayed Healing:\nSame cut takes 3-4+ weeks\n\nImportant: Foot wounds are especially serious in diabetes\n\nAnswer "Yes" if: Noticeably slower healing than normal',
        questions: [
            { 
                name: 'delayed_healing', 
                question_text: 'Do your wounds take longer to heal than usual?', 
                question_type: 'radio', 
                options: ['Yes', 'No'],
                ml_feature_mapping: {
                    feature_name: 'delayed healing',
                    value_mapping: { 'Yes': 1, 'No': 0 },
                    is_required: true,
                    default_value: 0
                }
            }
        ]
    },
    {
        name: 'Muscle Conditions',
        description: 'MUSCLE WEAKNESS & STIFFNESS\n\nTwo Related Problems:\n\n1. Weakness (Paresis)\n• Muscles lacking normal strength\n• Difficulty with tasks that were easy\n• Struggling to climb stairs, lift objects\n• Legs feel like they might "give out"\n\n2. Stiffness\n• Muscles feeling tight/rigid\n• Reduced flexibility\n• Cramping or spasms\n• Movement feels restricted\n\nWhy It Happens:\n\n• Nerve damage from high blood sugar\n• Muscles can\'t access glucose for fuel\n• Poor circulation\n• Muscle breakdown for energy\n\nCommon Areas Affected:\nLegs, Arms, Hands, Back\n\nAnswer Each Question Based On:\nWhether you\'ve noticed these specific symptoms affecting daily activities',
        questions: [
            { 
                name: 'partial_paresis', 
                question_text: 'Do you experience muscle weakness?', 
                question_type: 'radio', 
                options: ['Yes', 'No'],
                ml_feature_mapping: {
                    feature_name: 'partial paresis',
                    value_mapping: { 'Yes': 1, 'No': 0 },
                    is_required: true,
                    default_value: 0
                }
            },
            { 
                name: 'muscle_stiffness', 
                question_text: 'Do you experience muscle stiffness?', 
                question_type: 'radio', 
                options: ['Yes', 'No'],
                ml_feature_mapping: {
                    feature_name: 'muscle stiffness',
                    value_mapping: { 'Yes': 1, 'No': 0 },
                    is_required: true,
                    default_value: 0
                }
            }
        ]
    },
    {
        name: 'Hair Conditions',
        description: 'UNUSUAL HAIR LOSS (ALOPECIA)\n\nWhat It Means:\nLosing significantly more hair than normal.\n\nWhy It Happens:\n\n• Poor circulation to hair follicles\n• Hormonal imbalances\n• Nutritional deficiencies\n• Autoimmune factors\n\nWhere to Notice:\n\nScalp:\n• More hair in brush/shower drain\n• Visible scalp showing through\n• Thinning overall or bald patches\n• Receding hairline\n\nBody:\n• Thinning eyebrows\n• Reduced arm/leg hair\n• Sparse eyelashes\n\nNormal vs Concerning:\n\nNormal - 50-100 hairs/day, very gradual aging changes\nConcerning - Large clumps, rapid thinning, noticeable bald spots\n\nGood News: Often reversible with blood sugar control\n\nAnswer "Yes" if: Noticeable, unusual hair loss concerning to you',
        questions: [
            { 
                name: 'alopecia', 
                question_text: 'Have you noticed unusual hair loss?', 
                question_type: 'radio', 
                options: ['Yes', 'No'],
                ml_feature_mapping: {
                    feature_name: 'Alopecia',
                    value_mapping: { 'Yes': 1, 'No': 0 },
                    is_required: true,
                    default_value: 0
                }
            }
        ]
    }
];

const seedData = async () => {
    try {
        await connectDB();
        console.log('Connected to database');
        
        console.log('Clearing existing collections...');
        await Disease.deleteMany({});
        await Symptom.deleteMany({});
        await Question.deleteMany({});
        await Answer.deleteMany({});
        console.log('All collections cleared successfully');
        
        const diabetes = new Disease({
            name: 'Diabetes',
            description: 'A chronic condition that affects how your body processes blood sugar (glucose)',
            symptoms_description: 'Common symptoms that may indicate diabetes risk'
        });
        await diabetes.save();
        console.log('Created Diabetes disease');
        
        for (const category of categories) {
            const symptom = new Symptom({
                name: category.name,
                description: category.description,
                disease_id: diabetes._id
            });
            await symptom.save();
            console.log(`Created category: ${category.name}`);

            for (const questionData of category.questions) {
                const question = new Question({
                    question_text: questionData.question_text,
                    question_type: questionData.question_type,
                    symptom_id: symptom._id,
                    options: questionData.options || [],
                    ml_feature_mapping: questionData.ml_feature_mapping || {},
                    render_config: questionData.render_config || {}
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

seedData();
