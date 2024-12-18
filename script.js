// 預設題目
const colorQuestions = [
    {
        question: "RGB色彩模式中的'R'代表什麼顏色？",
        options: ["Red", "Blue", "Green", "Yellow"],
        answer: 0
    },
    {
        question: "下列哪個是三原色之一？",
        options: ["紫色", "橙色", "藍色", "棕色"],
        answer: 2
    },
    {
        question: "色相環中，紅色的對比色是什麼？",
        options: ["黃色", "藍色", "綠色", "紫色"],
        answer: 2
    },
    {
        question: "CMYK中的'Y'代表什麼顏色？",
        options: ["Yellow", "Yolk", "Yield", "Yarn"],
        answer: 0
    },
    {
        question: "哪種顏色通常被認為是最冷色調？",
        options: ["紅色", "黃色", "藍色", "綠色"],
        answer: 2
    }
];

let currentQuestion = 0;
let timeLeft = 600; // 10分鐘
let timer = null;
let isTestStarted = false;
let userAnswers = new Array(colorQuestions.length).fill(null);

// DOM 元素
const quizInfo = document.getElementById('quizInfo');
const quizContainer = document.getElementById('quizContainer');
const startBtn = document.getElementById('startBtn');
const submitBtn = document.getElementById('submitBtn');
const resultContainer = document.getElementById('resultContainer');
const timeDisplay = document.getElementById('timeDisplay');
const progressDisplay = document.getElementById('progressDisplay');
const progressBar = document.getElementById('progressBar');

// 事件監聽
startBtn.addEventListener('click', startQuiz);
submitBtn.addEventListener('click', submitQuiz);

// 開始測驗
function startQuiz() {
    isTestStarted = true;
    currentQuestion = 0;
    timeLeft = 600;
    userAnswers = new Array(colorQuestions.length).fill(null);
    
    startBtn.style.display = 'none';
    submitBtn.style.display = 'none';
    resultContainer.innerHTML = '';
    
    displayQuestion();
    startTimer();
    updateProgress();
}

// 顯示題目
function displayQuestion() {
    if (currentQuestion >= colorQuestions.length) {
        submitBtn.style.display = 'block';
        return;
    }

    const q = colorQuestions[currentQuestion];
    quizContainer.innerHTML = `
        <div class="question">
            <div class="question-text">
                <span class="question-number">${currentQuestion + 1}. </span>
                ${q.question}
            </div>
            <div class="options">
                ${q.options.map((option, index) => `
                    <label class="option">
                        <input type="radio" name="q${currentQuestion}" value="${index}">
                        ${option}
                    </label>
                `).join('')}
            </div>
        </div>
        ${currentQuestion < colorQuestions.length - 1 ? 
            
            
            `<button onclick="nextQuestion()" class="btn">
                <i class="fas fa-arrow-right"></i> 下一題
            </button>` : 
            `<button onclick="showSubmitButton()" class="btn">
                <i class="fas fa-check"></i> 完成作答
            </button>`
        }
    `;
}

// 下一題
function nextQuestion() {
    saveCurrentAnswer();
    
    currentQuestion++;
    displayQuestion();
    updateProgress();
    
    loadSavedAnswer();
}

// 新增儲存答案的函數
function saveCurrentAnswer() {
    const selected = document.querySelector(`input[name="q${currentQuestion}"]:checked`);
    if (selected) {
        userAnswers[currentQuestion] = parseInt(selected.value);
    }
}

// 新增載入已保存答案的函數
function loadSavedAnswer() {
    const savedAnswer = userAnswers[currentQuestion];
    if (savedAnswer !== null) {
        const radioBtn = document.querySelector(`input[name="q${currentQuestion}"][value="${savedAnswer}"]`);
        if (radioBtn) {
            radioBtn.checked = true;
        }
    }
}

// 顯示提交按鈕
function showSubmitButton() {
    saveCurrentAnswer();
    submitBtn.style.display = 'block';
}

// 更新進度
function updateProgress() {
    progressDisplay.textContent = `${currentQuestion + 1}/${colorQuestions.length}`;
    const progress = ((currentQuestion + 1) / colorQuestions.length) * 100;
    progressBar.style.width = `${progress}%`;
}

// 提交測驗
function submitQuiz() {
    clearInterval(timer);
    const results = calculateResults();
    displayResult(results.score);
    displayAnswerButton();
    
    isTestStarted = false;
    submitBtn.style.display = 'none';
    startBtn.style.display = 'block';
    startBtn.innerHTML = '<i class="fas fa-redo"></i> 重新測驗';
}

// 新增計算詳細結果的函數
function calculateResults() {
    let correct = 0;
    const details = [];
    
    saveCurrentAnswer();
    
    colorQuestions.forEach((q, index) => {
        const userAnswer = userAnswers[index];
        const userSelected = userAnswer !== null ? q.options[userAnswer] : "未作答";
        const isCorrect = userAnswer === q.answer;
        
        details.push({
            question: q.question,
            userSelected: userSelected,
            correctAnswer: q.options[q.answer],
            isCorrect: isCorrect
        });
        
        if (isCorrect) {
            correct++;
        }
    });
    
    return {
        score: (correct / colorQuestions.length) * 100,
        details: details
    };
}

// 新增顯示答案按鈕的函數
function displayAnswerButton() {
    const answerBtn = document.createElement('button');
    answerBtn.className = 'btn answer-btn';
    answerBtn.innerHTML = '<i class="fas fa-check-circle"></i> 查看答案';
    answerBtn.onclick = showAnswers;
    resultContainer.appendChild(answerBtn);
}

// 新增顯示答案的函數
function showAnswers() {
    const results = calculateResults();
    let answerHTML = '<div class="answer-section">';
    answerHTML += '<h3>答案對照表</h3>';
    
    results.details.forEach((result, index) => {
        answerHTML += `
            <div class="answer-item ${result.isCorrect ? 'correct' : 'incorrect'}">
                <p><strong>題目 ${index + 1}:</strong> ${result.question}</p>
                <p>您的答案: ${result.userSelected}</p>
                <p>正確答案: ${result.correctAnswer}</p>
                <p class="result-status">${result.isCorrect ? '✓ 正確' : '✗ 錯誤'}</p>
            </div>
        `;
    });
    
    answerHTML += '</div>';
    
    // 創建一個新的 div 來顯示答案
    const answerDisplay = document.createElement('div');
    answerDisplay.className = 'answer-display';
    answerDisplay.innerHTML = answerHTML;
    
    // 清除之前的答案顯示（如果有的話）
    const oldAnswerDisplay = document.querySelector('.answer-display');
    if (oldAnswerDisplay) {
        oldAnswerDisplay.remove();
    }
    
    resultContainer.appendChild(answerDisplay);
}

// 顯示結果
function displayResult(score) {
    const resultText = `
        <h2><i class="fas fa-award"></i> 測驗結果</h2>
        <p class="${score >= 60 ? 'pass' : 'fail'}">
            得分：${score.toFixed(1)}分
        </p>
        <p>${score >= 80 ? '太棒了！你是顏色專家！' : 
            score >= 60 ? '做得不錯！' : '再努力一下！'}</p>
    `;
    resultContainer.innerHTML = resultText;
}

// 計時器
function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        updateTimer();
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            submitQuiz();
            alert('時間到！');
        }
    }, 1000);
}

// 更新時間顯示
function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timeDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function generateCSV(userAnswers, questions) {
    let csvContent = "題號,問題,您的答案,正確答案,是否正確\n";
    
    questions.forEach((question, index) => {
        const userAnswer = userAnswers[index] || "未作答";
        const correctAnswer = question.correctAnswer;
        const isCorrect = userAnswer === correctAnswer ? "正確" : "錯誤";
        
        // 處理CSV中的特殊字符
        const questionText = question.question.replace(/,/g, "，");
        
        csvContent += `${index + 1},${questionText},${userAnswer},${correctAnswer},${isCorrect}\n`;
    });
    
    return csvContent;
}

function downloadAnswers(userAnswers, questions) {
    const csv = generateCSV(userAnswers, questions);
    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", "測驗答案.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function handleQuizSubmission() {
    // ... 原有的提交處理代碼 ...
    
    // 顯示下載按鈕
    const downloadBtn = document.getElementById('downloadAnswersBtn');
    downloadBtn.style.display = 'block';
    
    // 添加下載按鈕的點擊事件
    downloadBtn.addEventListener('click', () => {
        downloadAnswers(userAnswers, questions);
    });
} 