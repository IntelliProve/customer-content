// This object will store results coming from the plug-in
let biomarker_results = {
    HR: 0,
    RR: 0,
    HRV: 0,
    ANS: 0,
    RBS: 0,
    MRS: 0,
    AMSS: 0
};

// Fetch the biomarkers from the plug-in
window.addEventListener(
    "message",
    (event) => {
        if (event.data && event.data.stage === "results") {
            biomarker_results.HR = event.data.heart_rate;
            biomarker_results.RR = event.data.respiratory_rate;
            biomarker_results.HRV = event.data.heart_rate_variability;
            biomarker_results.ANS = event.data.ans_balance;
            biomarker_results.RBS = event.data.resonant_breathing_score
            biomarker_results.MRS = event.data.morning_readiness
            biomarker_results.AMSS = event.data.acute_mental_stress_score
        }
    },
    false,
);

//  Answers to the questions asked to the user are stored here. Refer to first tab of the excel.
let question_answers = {
    Q1: 0, // Output from question: How often do you exercise per week? Look at the column "Q output" in the excel.
    Q2: 0, // Output from question: How often do you exercise? Look at the column "Q output" in the excel.
    Q3: 0, // etc.
    Q4: 0,
    Q5: 0,
    Q6: 0,
    Q7: 0,
    Q8: 0
};


// Map biomarkers and questions to health buckets. Refer to the second tab of the excel.
// This is a template, please look at the excel for the correct formulas.
function checkEnergy(biomarker_results, question_answers) {
    if (biomarker_results.ANS >= 4) {
        return true;
    } else {
        return false;
    }
}

function checkImmunity(biomarker_results, question_answers) {
    if (
        (biomarker_results.HR >= 76 || biomarker_results.RR >= 20) &&
        biomarker_results.HRV <= 50 &&
        question_answers.Q3 + question_answers.Q6 >= 1
    ) {
        return true;
    } else {
        return false;
    }
}

function checkFatigue(biomarker_results, question_answers) {
    let current_time = new Date().getHours();
    if (current_time >= 6 && current_time < 12) {
        if (biomarker_results.ANS >= 4 || biomarker_results.MRS <= 4 || question_answers.Q6 === 1) {
            return true;
        } else {
            return false;
        }
    } else {
        if (biomarker_results.ANS >= 4 || question_answers.Q6 === 1) {
            return true;
        } else {
            return false;
        }
    }
}

function checkIronDeficiency(biomarker_results, question_answers) {
    let current_time = new Date().getHours();
    if (current_time >= 6 && current_time < 12) {
        if ((biomarker_results.ANS >= 4 || biomarker_results.MRS <= 4) && question_answers.Q4 + question_answers.Q5 >= 1 && question_answers.Q7 === 1) {
            return true;
        } else {
            return false;
        }
    } else {
        if (biomarker_results.ANS >= 4 && question_answers.Q4 + question_answers.Q5 >= 1 && question_answers.Q7 === 1) {
            return true;
        } else {
            return false;
        }
    }
}

function checkMentalStress(biomarker_results, question_answers) {
    if (biomarker_results.AMSS <= 50 || biomarker_results.HRV <= 50) {
        return true;
    } else {
        return false;
    }
}

function checkCholesterol(biomarker_results, question_answers) {
    let current_time = new Date().getHours();
    if (current_time >= 6 && current_time < 12) {
        if ((biomarker_results.HR >= 76 || biomarker_results.MRS <= 4) && question_answers.Q1 + question_answers.Q2 + question_answers.Q3 >= 2 && question_answers.Q7 === 1) {
            return true;
        } else {
            return false;
        }
    } else {
        if (biomarker_results.HR >= 76 && question_answers.Q1 + question_answers.Q2 + question_answers.Q3 >= 2 && question_answers.Q7 === 1) {
            return true;
        } else {
            return false;
        }
    }
}

// Check all health buckets, and assign scores. A 'true' means products from this health bucket can be recommended. Refer to the third tab in the excel.
let healthStatus = {
    Energy: checkEnergy(biomarker_results, question_answers),
    Immunity: checkImmunity(biomarker_results, question_answers),
    Fatigue: checkFatigue(biomarker_results, question_answers),
    IronDeficiency: checkIronDeficiency(biomarker_results, question_answers),
    MentalStress: checkMentalStress(biomarker_results, question_answers),
    Cholesterol: checkCholesterol(biomarker_results, question_answers)
};
// When all buckets are set to 'false', the Healthy bucket is true, and products from the healthy bucket should be recommended.
healthStatus.Healthy = Object.values(healthStatus).every(val => val === 0) ? true : false;

// The healthStatus object can now be used to recommend the correct products in the website

let productsPerBucket = {
    Energy: ["Mangesium", "VitaminE", "..."], // see excel
    Immunity: ["VitaminC", "Zinc", "..."], // see excel
    Fatigue: ["Mangesium", "Melatonin", "..."], // see excel
    IronDeficiency: ["Ferrotone", "..."], // see excel
    MentalStress: ["BitaminB6", "Ferrotone", "..."], // see excel
    Cholesterol: ["Omega3", "..."], // see excel
    Healthy: ["vitaminC", "Glucosamine", "..."] //see excel
};

let six_selected_products = []; // this will contain the six products to recommend to the user

if (healthStatus.Healthy) {
    // recommend 6 products from healthy bucket
    for (let i = 0; i < 6; i++) {
        six_selected_products.push(productsPerBucket.Healthy[Math.floor(Math.random() * productsPerBucket.Healthy.length)]);
    }
} else {
    // at least one of the other buckets are set to true
    let productsToChoose = Object.keys(healthStatus).filter(bucket => healthStatus[bucket]);

    let counter = 0;

    while (counter < 6) {
        six_selected_products.push(productsToChoose[counter % productsToChoose.length]);
        counter++;
    }
}