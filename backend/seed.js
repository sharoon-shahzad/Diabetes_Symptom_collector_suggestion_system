import mongoose from 'mongoose';
import { Disease } from './models/Disease.js';
import { Symptom } from './models/Symptom.js';
import { Question } from './models/Question.js';
import { Role } from './models/Role.js';
import { UsersRoles } from './models/User_Role.js';
import { User } from './models/User.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/Diavise';

const symptomsData = [
  {
    name: 'Frequent Urination (Polyuria)',
    description: 'Passing urine more often than usual, especially at night, due to excess glucose pulling fluid from the body.',
    questions: [
      { question_text: 'Do you urinate more than 7 times during the day?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Do you often wake up at night to urinate?', question_type: 'dropdown', options: ['Never', 'Sometimes', 'Often', 'Every night'] },
      { question_text: 'Have you noticed an increase in the volume of urine passed recently?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Do you feel a strong urge to urinate frequently, even when little comes out?', question_type: 'radio', options: ['Yes', 'No'] },
    ],
  },
  {
    name: 'Excessive Thirst (Polydipsia)',
    description: 'Constant or abnormal thirst caused by fluid loss from excessive urination.',
    questions: [
      { question_text: 'Do you feel thirsty more frequently than usual?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Are you drinking more water than usual in a day?', question_type: 'dropdown', options: ['Less than 1L', '1–2L', '2–4L', 'More than 4L'] },
      { question_text: 'Does your mouth often feel dry even after drinking water?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Does drinking water not seem to satisfy your thirst?', question_type: 'radio', options: ['Yes', 'No'] },
    ],
  },
  {
    name: 'Increased Hunger (Polyphagia)',
    description: 'Intense hunger caused by the body\'s inability to properly use glucose for energy.',
    questions: [
      { question_text: 'Do you feel hungry even after eating a full meal?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Have you experienced frequent cravings for sweets or snacks recently?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Do you eat more meals per day than you used to?', question_type: 'dropdown', options: ['Fewer than 3', '3', 'More than 3'] },
      { question_text: 'Have you gained weight due to increased eating in the past 2 months?', question_type: 'radio', options: ['Yes', 'No'] },
    ],
  },
  {
    name: 'Unexplained Weight Loss',
    description: 'Weight loss despite normal or increased appetite; usually due to glucose loss through urine.',
    questions: [
      { question_text: 'Have you lost weight without dieting or exercising recently?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'How much weight have you lost in the past 2 months?', question_type: 'dropdown', options: ['None', '1–2 kg', '3–5 kg', '5+ kg'] },
      { question_text: 'Do your clothes feel looser recently even though your eating habits are unchanged?', question_type: 'radio', options: ['Yes', 'No'] },
    ],
  },
  {
    name: 'Fatigue / Tiredness',
    description: 'Constant low energy due to cells not receiving glucose properly.',
    questions: [
      { question_text: 'Do you feel tired most of the day despite sleeping well?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Does physical activity exhaust you more than usual?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Do you feel tired soon after waking up?', question_type: 'radio', options: ['Yes', 'No'] },
    ],
  },
  {
    name: 'Blurred Vision',
    description: 'High blood sugar causes fluid to be pulled from eye lenses, affecting focus.',
    questions: [
      { question_text: 'Have you experienced any blurriness in your vision recently?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Does your vision fluctuate throughout the day?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Do you need to rub your eyes often or strain to focus?', question_type: 'radio', options: ['Yes', 'No'] },
    ],
  },
  {
    name: 'Slow Healing Wounds',
    description: 'High glucose levels interfere with blood flow and immune response, delaying healing.',
    questions: [
      { question_text: 'Do your cuts or wounds take longer than usual to heal?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Do you currently have any wound/injury that has not healed for more than 10 days?', question_type: 'radio', options: ['Yes', 'No'] },
    ],
  },
  {
    name: 'Frequent Infections',
    description: 'Weakened immune function increases susceptibility to bacterial and fungal infections.',
    questions: [
      { question_text: 'Do you experience frequent skin, gum, or urinary tract infections?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Have you had 2 or more infections in the last 3 months?', question_type: 'radio', options: ['Yes', 'No'] },
    ],
  },
  {
    name: 'Numbness or Tingling (Neuropathy)',
    description: 'Nerve damage from prolonged high blood sugar causes loss of sensation.',
    questions: [
      { question_text: 'Do you feel tingling or “pins and needles” in your feet or hands?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Do you experience numbness or loss of sensation in your feet while walking?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Has the sensation in your limbs changed recently?', question_type: 'radio', options: ['Yes', 'No'] },
    ],
  },
  {
    name: 'Very Dry Skin',
    description: 'Dehydration caused by frequent urination and poor circulation may dry out skin.',
    questions: [
      { question_text: 'Is your skin dry even after moisturizing or drinking fluids?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Do you have cracks, flakes, or itching due to dry skin?', question_type: 'radio', options: ['Yes', 'No'] },
    ],
  },
  {
    name: 'Nausea / Vomiting / Abdominal Pain',
    description: 'In Type 1 diabetes, especially during diabetic ketoacidosis (DKA), stomach pain and nausea can occur.',
    questions: [
      { question_text: 'Do you experience unexplained nausea or stomach pain frequently?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Have you vomited without an identifiable cause in the past week?', question_type: 'radio', options: ['Yes', 'No'] },
    ],
  },
  {
    name: 'Fruity-Smelling Breath',
    description: 'A hallmark sign of diabetic ketoacidosis (DKA), common in unmanaged Type 1 diabetes.',
    questions: [
      { question_text: 'Have you ever noticed a fruity or sweet smell in your breath?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Have others commented on a strange smell from your mouth recently?', question_type: 'radio', options: ['Yes', 'No'] },
    ],
  },
  // Non-symptom categories as symptoms for seeding
  {
    name: 'General Health',
    description: 'Basic user profile data and physiological info.',
    questions: [
      { question_text: 'What is your age?', question_type: 'number' },
      { question_text: 'What is your biological sex?', question_type: 'dropdown', options: ['Male', 'Female', 'Other'] },
      { question_text: 'Are you currently pregnant?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Have you had diabetes during pregnancy (gestational diabetes)?', question_type: 'radio', options: ['Yes', 'No'] },
    ],
  },
  {
    name: 'Family History',
    description: 'Genetic risk factor assessment.',
    questions: [
      { question_text: 'Does your mother, father, or sibling have diabetes?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Does diabetes run in your extended family (grandparents, uncles/aunts)?', question_type: 'radio', options: ['Yes', 'No'] },
    ],
  },
  {
    name: 'Lifestyle & Habits',
    description: 'Behavior-based risk factors related to diet and activity.',
    questions: [
      { question_text: 'Do you engage in physical activity at least 3 times per week?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'How often do you consume sugary drinks?', question_type: 'dropdown', options: ['Daily', 'Weekly', 'Rarely', 'Never'] },
      { question_text: 'How many hours do you sleep on average per night?', question_type: 'dropdown', options: ['Less than 4', '4–6', '6–8', 'More than 8'] },
      { question_text: 'Do you smoke or use tobacco products?', question_type: 'radio', options: ['Yes', 'No'] },
    ],
  },
  {
    name: 'Medical Background',
    description: 'Pre-existing conditions and medical triggers.',
    questions: [
      { question_text: 'Have you ever been diagnosed with high blood pressure?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Have you been told you have high cholesterol or triglycerides?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Have you been diagnosed with insulin resistance or prediabetes?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Are you taking medications that affect blood sugar (e.g., steroids)?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'Have you been hospitalized due to very high blood sugar?', question_type: 'radio', options: ['Yes', 'No'] },
      { question_text: 'For females: Have you been diagnosed with PCOS?', question_type: 'radio', options: ['Yes', 'No'] },
    ],
  },
];

async function seed() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  // Ensure admin role exists
  let adminRole = await Role.findOneAndUpdate(
    { role_name: 'admin' },
    { role_name: 'admin' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log('Admin role upserted:', adminRole.role_name);

  // Assign admin role to the specified user
  const adminUserId = '6884fda2a1a99a1022b80bac';
  const adminUserEmail = '221429@students.au.edu.pk';
  const adminUser = await User.findOne({ _id: adminUserId, email: adminUserEmail });
  if (adminUser) {
    const alreadyAssigned = await UsersRoles.findOne({ user_id: adminUser._id, role_id: adminRole._id });
    if (!alreadyAssigned) {
      await UsersRoles.create({ user_id: adminUser._id, role_id: adminRole._id });
      console.log('Admin role assigned to user:', adminUser.email);
    } else {
      console.log('Admin role already assigned to user:', adminUser.email);
    }
  } else {
    console.log('Admin user not found, cannot assign admin role.');
  }

  // Ensure user role exists
  let userRole = await Role.findOneAndUpdate(
    { role_name: 'user' },
    { role_name: 'user' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log('User role upserted:', userRole.role_name);

  // Assign user role to the specified user
  const normalUserId = '6880d502873514b36914e931';
  const normalUserEmail = '221360@students.au.edu.pk';
  const normalUser = await User.findOne({ _id: normalUserId, email: normalUserEmail });
  if (normalUser) {
    const alreadyAssigned = await UsersRoles.findOne({ user_id: normalUser._id, role_id: userRole._id });
    if (!alreadyAssigned) {
      await UsersRoles.create({ user_id: normalUser._id, role_id: userRole._id });
      console.log('User role assigned to user:', normalUser.email);
    } else {
      console.log('User role already assigned to user:', normalUser.email);
    }
  } else {
    console.log('Normal user not found, cannot assign user role.');
  }

  // Upsert Diabetes Disease
  let disease = await Disease.findOneAndUpdate(
    { name: 'Diabetes' },
    {
      name: 'Diabetes',
      description: 'A chronic condition characterized by high levels of sugar (glucose) in the blood.',
      symptoms_description: 'Symptoms vary but commonly include excessive thirst, frequent urination, and unexplained weight loss.',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log('Disease upserted:', disease.name);

  for (const symptomData of symptomsData) {
    // Upsert Symptom
    let symptom = await Symptom.findOneAndUpdate(
      { name: symptomData.name, disease_id: disease._id },
      {
        name: symptomData.name,
        description: symptomData.description,
        disease_id: disease._id,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log('Symptom upserted:', symptom.name);

    // Insert Questions for this Symptom
    for (const q of symptomData.questions) {
      await Question.findOneAndUpdate(
        { question_text: q.question_text, symptom_id: symptom._id },
        {
          question_text: q.question_text,
          category: '',
          symptom_id: symptom._id,
          question_type: q.question_type,
          options: q.options || [],
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log('  Question upserted:', q.question_text);
    }
  }

  console.log('Seeding complete!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
}); 