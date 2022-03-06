//https://github.com/JsonLucas/rebuild-Projeto-06.git

const createQuizData = {
    quizTitle:'',
    urlImageQuiz: '',
    numQuestions: 0,
    numLevels: 0
}
const validateUrl = {
    http: 'http://',
    https: 'https://'
}
let quizData = [/*{
    title: '',
    image: '',
    questions: [{
        title: '',
        color: '',
        answers: [{
            text: '',
            image: '',
            isCorrectAnswer: false
        }]
    }],
    levels: [{
        title: '',
        image: '',
        text: '',
        minValue: 0
    }]
}*/];

let indexAnswer = 0;
let indexScroll = 0;
let userAnswers = [];
let chosenQuiz;


function loadQuiz(){
    document.querySelector('.main').innerHTML = '<section class="page-body"></section>';
    const request = axios.get('https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes');
    request.then((response) => {
        const quizes = document.querySelector('.page-body');
        renderCreateQuiz(quizes);
        for(let i in response.data){
            quizes.innerHTML += `
            <div id='${response.data[i].id}' class='single-quiz' onclick='renderSingleQuiz(this);'>
                <div class='overlap'></div>
                <div class='thumb-quiz'><img src='${response.data[i].image}' alt='Imagem não carregada.'></div>
                <div class='title-quiz'><p>${response.data[i].title}</p></div>    
            </div>`;
        }
    }).catch((error) => {
        console.log(error);
    })
}

function renderCreateQuiz(sectionQuizes){
    sectionQuizes.innerHTML += `
    <div id='' class='owner-quiz''>
        <input type='button' value='Criar quiz' class='btn-create-quiz' onclick='renderCreateBasicQuizInfo();'>
    </div>`
}

function renderSingleQuiz(object){
    chosenQuiz = object.id;
    const request = axios.get(`https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes/${object.id}`);
    let rowIndexer = 0;
    request.then((response) => {
        const main = document.querySelector('.main');
        const questions = response.data.questions;
        console.log(response.data);
        main.innerHTML = `<div class='image-single-quiz'>
            <div class='overlap-banner-quiz'></div>
            <img src='${response.data.image}' alt='Imagem não carregada.'>
            <span class='quiz-title'>${response.data.title}</span>
        </div><div class='main-container-questions'>`;
        for(let i in questions){
            main.innerHTML += `<div class='subcontainer-question'>
                <div class='quiz-question'><p>${questions[i].title}</p></div>
                <div class='container-answers container-question-${i}'>
                    <div class='answers-row' id='row-${rowIndexer}'>
                    ${renderSingleAnswer(questions[i], object, ++rowIndexer)}</div>
                </div></div>`;
            document.querySelectorAll('.quiz-question')[i].style.background = questions[i].color;
            rowIndexer++;
        }
        main.innerHTML += `</div>`;
    }).catch((error) => {
        console.log(error);
    });
}

function isCorrect(object, id){
    const container = object.parentNode.parentNode;
    let answer = document.querySelector(`#${object.id} > .title-answer`).innerHTML;
    const request = axios.get(`https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes/${id}`);
    request.then((response) => {
        const questions = response.data.questions;
        const levels = response.data.levels;
        const answers = getAnswers(questions);
        for(let i in answers){
            for(let j in answers[i]){
                if(answer === answers[i][j].text){
                    if(answers[i][j].isCorrectAnswer){
                        indexScroll += answers.length;
                        setTimeout(() => {
                            const selector = document.querySelector(`#answer-${indexScroll}`);
                            if(selector !== undefined){
                                selector.scrollIntoView();
                            }
                        }, 2000);
                        removeClickEvent(container);
                        correctAnswer(container, object);
                    }else{
                        setTimeout(() => {
                            const selector = document.querySelector(`#answer-${indexScroll}`);
                            if(selector !== undefined){
                                selector.scrollIntoView();
                            }
                        }, 2000);
                        removeClickEvent(container);
                        wrongAnswers(answers[i], object.id, container);
                    }
                    userAnswers.push(answers[i][j].isCorrectAnswer);
                    answer = '';
                }
            }
        }
        if(userAnswers.length === questions.length){
            endQuiz(userAnswers, questions.length, levels);
        }
    }).catch((error) => {
        console.log(error);
    });
}

function getAnswers(questionAnswers){
    let answers = {};
    for(let i in questionAnswers){
        answers[i] = questionAnswers[i].answers;
    }
    return answers;
}

function renderSingleAnswer(question, object, rowIndexer){
    let renderSingle = '';
    let column = [], sortedIndex;
    for(let a = 0; a < question.answers.length; a++){
        column.push(a);
    }
    for(let j in question.answers){
        let aux = parseInt(j);
        if((question.answers.length%2 === 0) && (question.answers.length > 2)){
            if(aux === (question.answers.length/2)){
                renderSingle += `</div><div class='answers-row' id='row-${rowIndexer}'>`;
            }
        }
        sortedIndex = column[Math.floor((Math.random() * column.length))];
        column.splice(column.indexOf(sortedIndex), 1);
        renderSingle += `
        <div class='single-answer' onclick='isCorrect(this, ${object.id});' id='answer-${indexAnswer}'>
            <img src='${question.answers[sortedIndex].image}' alt='Imagem não carregada.'>
            <div class='title-answer'>${question.answers[sortedIndex].text}</div>
        </div>`;
        indexAnswer++;
    }
    return renderSingle;
}

function auxRenderSingleAnswer(renderSingle){
    for(let j in question.answers){
        renderSingle += `
        <div class='single-answer' onclick='isCorrect(this, ${object.id});' id='answer-${indexAnswer}'>
            <img src='${question.answers[j].image}' alt='Imagem não carregada.'>
            <div class='title-answer'>${question.answers[j].text}</div>
        </div>`;
        indexAnswer++;
    }
}

function removeClickEvent(container){
    const childrenRows = container.children;
    const elements = selectElements(childrenRows);
    for(let i = 0; i < elements.length; i++){
        elements[i].removeAttribute('onclick');
    }
}

function selectElements(childrenRows){
    let elements = [];
    let auxElements;
    for(let i = 0; i < childrenRows.length; i++){
        auxElements = document.querySelector(`#${childrenRows[i].id}`);
        for(let j = 0; j < auxElements.children.length; j++){
            elements.push(auxElements.children[j]);
        }
    }
    return elements;
}

function correctAnswer(container, object){
    const childrenRows = container.children;
    const elements = selectElements(childrenRows);
    for(let i = 0; i < elements.length; i++){
        if(elements[i].id !== object.id){
            elements[i].style.color = 'red';
            elements[i].style.opacity = '0.6';
        }else{
            object.style.color = 'green';
        }
    }
}

function wrongAnswers(answers, objectId, container){
    const childrenRows = container.children;
    const elements = selectElements(childrenRows);
    let answerOptions = [];
    for(let i=0; i < elements.length; i++){
        answerOptions.push(document.querySelector(`#${elements[i].id} > .title-answer`).innerHTML);
    }
    for(let i in answers){
        if(elements[i].id !== objectId){
            elements[i].style.opacity = '0.6';
        }
        for(let j=0; j < answerOptions.length; j++){
            if(answerOptions[j] === answers[i].text){
                if(answers[i].isCorrectAnswer){
                    elements[j].style.color = 'green';
                }else{
                    elements[j].style.color = 'red';
                }
            }
        }
    }
}

function endQuiz(optionAnswers, questionsLength, levels){
    let pontuation = 0;
    let userLevel = {'image': '', 'text': '', 'title': ''}; 
    for(let i = 0; i < optionAnswers.length; i++){
        if(optionAnswers[i]){
            pontuation++;
        }
    }
    let score = (pontuation/questionsLength)*100;
    score = score.toFixed(0);
    console.log(`pontuação: ${score}`);
    for(let i in levels){
        if(score >= levels[i].minValue){
            userLevel = levels[i];
        }
    }
    renderCardEndQuiz(score, userLevel);
}

function renderCardEndQuiz(score, userLevel){
    const main = document.querySelector('.main');
    setTimeout(() => {
    main.innerHTML += `<section class='level-user-card'>
        <div class='title-level'><p>${score}% de acertos: ${userLevel.title}</p></div>
        <div class='img-level'><img src='${userLevel.image}' alt='Imagem não carregada.'></div>
        <div class='text-level'><p>${userLevel.text}</p></div>
    </section>
    <div class='buttons-quiz-page'>
        <div class='reset-button'><button onclick='restartQuiz(this);' value='${chosenQuiz}'>Reiniciar quiz</button></div>
        <div class='back-home-button'><button onclick='backHome();'>Voltar pra Home</button></div></div>`
    document.querySelector('.text-level').scrollIntoView();
    }, 2000)    
}

function restartQuiz(object){
    const obj = {'id': object.value};
    document.querySelector('.main').innerHTML = '';
    renderSingleQuiz(obj);
}

function backHome(){
    document.querySelector('.main').innerHTML = '';
    loadQuiz();
}

function renderCreateBasicQuizInfo(){
    const main = document.querySelector('.main');
    main.innerHTML = '';
    main.innerHTML += `
        <section class='section-basic-info'>
            <div class='container-basic-info'>
                <div class='start'><p>Comece pelo começo</p></div>
                <div class='fields'>
                    <div class='single-field'>
                        <input type='text' class='field' placeholder='Título do seu quiz' minlength='20' maxlength='65'>
                    </div><div class='single-field'>
                        <input type='text' class='field image-url' placeholder='URL da imagem do seu quiz'>
                    </div><div class='single-field'>
                        <input type='number' class='field' placeholder='Quantidade de perguntas do seu quiz'>
                    </div><div class='single-field'>
                        <input type='number' class='field' placeholder='Quantidade de níveis do seu quiz'>
                    </div><div class='btn-next'>
                        <input type='button' onclick='formatBasicData();' 
                        value='Prosseguir para criar perguntas'>
                    </div>
                </div>
            </div>
        </section>
    `;
}

function renderCreateQuizQuestions(){
    const main = document.querySelector('.main');
    main.innerHTML = `<section class='section-create-questions'>
        <div class='container-questions-info'>
            <div class='start'><p>Crie suas perguntas</p></div>`;
    for(let i = 0; i < parseInt(createQuizData.numQuestions); i++){
        main.innerHTML += `
            <div class='create-level' id='question-${i}'>
                <div class='label-create-level' id='label-${i}'>
                    <p>Pergunta ${(i+1)}</p>
                    <span><ion-icon name="create-outline"></ion-icon></span>
                </div>
                ${renderDropdownQuestionsFields(i)}
            </div>
        `;
        document.querySelector(`#label-${i}`).setAttribute('onclick', 'toggleFields(this);');
    }
    main.innerHTML += `<div class='btn-next'>
        <input type='button' onclick='formatQuestionsData();' 
        value='Prosseguir para criar níveis'>
    </div></div></section>`;
}

function renderDropdownQuestionsFields(index){
    return `<div class='container-fields non-visible'>
        <div class='fields'>
            <div class='single-field'>
                <input type='text' class='title-question' placeholder='Texto da pergunta' minlength='20'>
            </div><div class='single-field'>
                <input type='text' class='bg-color' placeholder='Cor de fundo da pergunta(ex: #ffffff)' minlength='7' maxlength='7'>
            </div>
        </div>
        <div class='label-create-level'><p>Resposta correta</p></div>
        <div class='fields'>
            <div class='single-field'>
                <input type='text' class='field answer-${index}' placeholder='Resposta correta'>
            </div><div class='single-field'>
                <input type='text' class='field image-url image-${index}' placeholder='URL da imagem'>
            </div>
        </div>
        <div class='label-create-level'><p>Respostas incorretas</p></div>
        <div class='fields'>
            <div class='single-field'>
                <input type='text' class='field answer-${index}' placeholder='Resposta incorreta 1'>
            </div><div class='single-field'>
                <input type='text' class='field image-url image-${index}' placeholder='URL da imagem'>
            </div>
        </div>
        <div class='fields'>
            <div class='single-field'>
                <input type='text' class='field answer-${index}' placeholder='Resposta incorreta 2'>
            </div><div class='single-field'>
                <input type='text' class='field image-url image-${index}' placeholder='URL da imagem'>
            </div>
        </div>
        <div class='fields'>
            <div class='single-field'>
                <input type='text' class='field answer-${index}' placeholder='Resposta incorreta 3'>
            </div><div class='single-field'>
                <input type='text' class='field image-url image-${index}' placeholder='URL da imagem'>
            </div>
        </div>
    </div>`;
}

function renderCreateQuizLevels(){
    const main = document.querySelector('.main');
    main.innerHTML = `<section class='section-create-levels'>
        <div class='container-levels-info'>
            <div class='start'><p>Agora, decida os níveis</p></div>`;
    for(let i = 0; i < parseInt(createQuizData.numLevels); i++){
        main.innerHTML += `
            <div class='create-level' id='question-${i}'>
                <div class='label-create-level' id='label-${i}'>
                    <p>Nível ${(i+1)}</p>
                    <span><ion-icon name="create-outline"></ion-icon></span>
                </div>
                ${renderDropdownLevelFields()}
            </div>
        `;
        document.querySelector(`#label-${i}`).setAttribute('onclick', 'toggleFields(this);');
    }
    main.innerHTML += `<div class='btn-next'>
        <input type='button' onclick='formatLevelsData();' 
        value='Finalizar Quizz'>
    </div></div></section>`;
}

function renderDropdownLevelFields(){
    return `<div class='container-fields non-visible'>
        <div class='label-create-level'><p>Resposta correta</p></div>
        <div class='fields'>
            <div class='single-field'>
                <input type='text' class='field level-title' placeholder='Título do nível' minlength='10'>
            </div><div class='single-field'>
                <input type='number' class='field min-score' placeholder='% de acertos mínimo'>
            </div><div class='single-field'>
                <input type='text' class='field image-level-url' placeholder='URL da imagem do nível'>
            </div><div class='single-field'>
                <textarea class='field level-description' minlength='30' placeholder='Descrição do nível'></textarea>
            </div>
        </div>
    </div>`;
}

function renderViewCreatedQuiz(){
    const main = document.querySelector('.main');
    //const request = axios.get();
    console.log(quizData);
    main.innerHTML = ``;
}

function toggleFields(object){
    const parent = document.querySelector(`#${object.id}`).parentElement;
    document.querySelector(`#${parent.id} > .container-fields`).classList.toggle('non-visible');
}

function setQuestionsData(){
    const titleQuestion = document.querySelectorAll('.title-question');
    const bgColor = document.querySelectorAll('.bg-color');
    let questions = [];
    let auxAnswers = [];
    for(let i = 0; i < titleQuestion.length; i++){
        questions.push({title: titleQuestion[i].value, color: bgColor[i].value, answers: ''});
        const answers = document.querySelectorAll(`.answer-${i}`);
        const urlImage = document.querySelectorAll(`.image-${i}`);
        for(let j = 0; j < answers.length; j++){
            auxAnswers.push({
                text: answers[j].value, 
                image: urlImage[j].value, 
            });
            if(j === 0){
                auxAnswers[j].isCorrectAnswer = true;
            }else{
                auxAnswers[j].isCorrectAnswer = false;
            }
        }
        questions[i].answers = auxAnswers;
        auxAnswers = [];
    }
    quizData[0].questions = questions;
    console.log(questions);
}

function setLevelsData(){
    const levelTitle = document.querySelectorAll('.level-title');
    const minScore = document.querySelectorAll('.min-score');
    const imageLevelUrl = document.querySelectorAll('.image-level-url');
    const levelDescription = document.querySelectorAll('.level-description');
    let level = [];
    for(let i = 0; i < levelTitle.length; i++){
        level.push({
            title: levelTitle[i].value,
            image: imageLevelUrl[i].value,
            text: levelDescription[i].value,
            minValue: minScore[i].value
        });
    }
    quizData[0].levels = level;
    console.log(level);
}

function formatBasicData(){
    const inputs = document.querySelectorAll('.field');
    let isValid = true;
    if(!isEmpty(inputs)){
        for(let i = 0; i < inputs.length; i++){
            switch(i){
                case 0:
                createQuizData.quizTitle = inputs[i].value;
                break;
                case 1:
                if(isUrlValid()){
                    createQuizData.urlImageQuiz = inputs[i].value;
                }else{
                    isValid = false;
                    alert('voce precisa inserir uma url válida para a imagem.');
                    renderCreateBasicQuizInfo();
                }
                break;
                case 2:
                if(parseInt(inputs[i].value) >= 3){
                    createQuizData.numQuestions = inputs[i].value;
                }else{
                    isValid = false;
                    alert('seu quiz deve ter ao menos três perguntas.');
                    renderCreateBasicQuizInfo();
                }
                break;
                case 3:
                if(parseInt(inputs[i].value) >= 2){
                    createQuizData.numLevels = inputs[i].value;
                }else{
                    isValid = false;
                    alert('seu quiz deve ter ao menos dois níveis.');
                    renderCreateBasicQuizInfo();
                }
                break;
            }
        }
        if(isValid){
            quizData.push({
                title: createQuizData.quizTitle, 
                image: createQuizData.urlImageQuiz, 
                questions: '', 
                levels: ''
            });
            renderCreateQuizQuestions();
        }
    }else{
        alert('Todos os campos precisam ser preenchidos.');
        renderCreateBasicQuizInfo();
    }
}

function formatQuestionsData(){
    const fields = document.querySelectorAll('.field');
    if(!isEmpty(fields)){
        if(isUrlValid()){
            setQuestionsData();
            renderCreateQuizLevels();
        }else{
            alert('insira urls válidas para imagens');
            renderCreateQuizQuestions();
        }
    }else{
        alert('todos os campos precisam ser preenchidos.');
        renderCreateQuizQuestions();
    }
}

function formatLevelsData(){
    const fields = document.querySelectorAll('.field');
    if(!isEmpty(fields)){
        if(isUrlValid()){
            setLevelsData();
            const request = axios.post('https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes', quizData);
            request.then((response) => {
                console.log(response);
            }).catch((error) => {
                console.log(error);
            });
            renderViewCreatedQuiz();
        }else{
            alert('insira urls válidas para imagens');
            renderCreateQuizLevels();
        }
    }else{
        alert('todos os campos precisam ser preenchidos.');
        renderCreateQuizLevels();
    }
}

function isUrlValid(){
    const imageUrl = document.querySelectorAll('.image-url');
    let isValid = true;
    for(let i = 0; i < imageUrl.length; i++){
        if((validateUrl.http !== imageUrl[i].value.substring(0, 7)) && 
        (validateUrl.https !== imageUrl[i].value.substring(0, 8))){
            isValid = false;
        }
    }
    return isValid;
}

function isEmpty(inputs){
    let verificator = false;
    for(let i = 0; i < inputs.length; i++){
        if(inputs[i].value === ''){
            verificator = true;
        }
    }
    return verificator;
}