let EPSILON = String.fromCharCode(949); // epsilon symbol
let SIGMA = ['a', 'b'];  // fsm alphabet

class Stack { 
    // Array is used to implement stack 
    constructor(){ 
      this.items = []; 
    } 

    // push function 
    push(element) { 
        // push element into the items 
        this.items.push(element); 
    } 

    // pop function 
    pop()     { 
      // return top most element in the stack 
      // and removes it from the stack 
      // Underflow if stack is empty 
      if (this.items.length == 0) 
        return "Underflow"; 
      return this.items.pop(); 
    }

    // peek function 
    peek(){ 
      // return the top most element from the stack 
      // but does'nt delete it. 
      return this.items[this.items.length - 1]; 
    } 

    // isEmpty function 
    isEmpty(){ 
      // return true if stack is empty 
      return this.items.length == 0; 
    } 

    // printStack function 
    printStack(){ 
      let str = ""; 
      for (let i = 0; i < this.items.length; i++) 
        str += this.items[i] + " "; 
      return str; 
    } 
}

let regexArr = JSON.parse(localStorage.getItem('regexArr')) || [];
let c = regexArr.length-1;

function removeRegex(regex){
    let index = regexArr.indexOf(regex);
    if (index !== -1) {
        regexArr.splice(index, 1);
    }
    addDropDownContents();
    localStorage.setItem('regexArr', JSON.stringify(regexArr));
}


function addDropDownContents(){
    var dropdownMenu = document.querySelector('.dropdown-menu');
    dropdownMenu.innerHTML = '';
    if(!regexArr.length){
        dropdownMenu.innerHTML = '<p>No Regex Uploaded</p>'   
        return; 
    }

    for(let i = 0; i<regexArr.length; i++){
        dropdownMenu.innerHTML += `
        <li class="dropdown-item">
            ${regexArr[i]} <button type="button" class="btn btn btn-sm" onclick = "
                removeRegex('${regexArr[i]}');
            ">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-square" viewBox="0 0 16 16">
                    <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                </svg>
            </button>
        </li>  
        `
    }   
}


class Regex {

    constructor() {
        this.regex = "";
    }

    generate2(userExpr){
        //Teacher should represent epsilon as e but it will be converted to actual epsilon symbol here
        userExpr = this.eToEpsilon(userExpr);
        this.postfix = this.regexToPostfix(userExpr);
        this.alphabetInRegex = this.getRegexAlphabet();
        this.regex =  userExpr;
        console.log("postfix: " + this.postfix);
        this.nfa = this.#regexToNfa(this.postfix);
    }

    getRegexAlphabet(){
        let usedAlphabet = [];
        for(let i = 0; i< this.postfix.length; i++){
            if(SIGMA.includes(this.postfix[i]) && !usedAlphabet.includes(this.postfix[i])){
                usedAlphabet.push(this.postfix[i]);
            }
        }
        return usedAlphabet;
    }

    eToEpsilon(str){
        let newStr = "";
        for(let i = 0; i<str.length; i++){
            if(str[i] === "e"){
                newStr+=EPSILON;
            }
            else{
                newStr+=str[i];
            }
        }
        return newStr;
    }

    removeSpace(str){
        let newStr = "";
        for(let i = 0; i<str.length; i++){
          if(str[i] !== " "){
            newStr+=str[i];
          }
        }
        return newStr;
    }
  
    regexToPostfix(regex){
        regex = this.removeSpace(regex);
        let stack = new Stack();
        let postfix = "";
        let prev = "";
        for(let i = 0; i<regex.length; i++){
          if(SIGMA.includes(regex[i]) || regex[i] === EPSILON){
            if(SIGMA.includes(prev) || prev === EPSILON || prev === "*"){
              stack.push(".")
            }
            postfix+=regex[i];
          }
          else if (regex[i] === "*"){
            postfix+="*"
          }
          else if (regex[i] === "("){
            if(prev !=="" && prev !== "+" && prev != "("){
              stack.push(".")
            }
            stack.push("(");
          }
          else if (regex[i] === ")"){
            while(stack.peek() !== '('){
              postfix+=stack.pop();
            }
            stack.pop();
          }
          else if(regex[i] === "+"){
            while(stack.peek() === "."){
              postfix+=stack.pop();
            }
            stack.push("+");
          }
          else{
            stack.push(regex[i]);
          }
          prev = regex[i];
        }
        while(!stack.isEmpty()){
          postfix+=stack.pop();
        }
        return postfix;
    }

    /**
     * Convert regular expression into equivalent NFA using Thompson's construction
     * @param {String} regex A regular expression in postfix
     * @returns {
     *  Array<{
     *      table: 
     *          Array<{
     *              stateID: Number,
     *              symbol: String,
     *              stateIDs: Array<Number>
     *          }>,
     *      start: Number,
     *      end: Array<Number>
     *  }>
     * } State transition table for NFA accepting regex
     *  (alongside start state and accept states)
     */
    #regexToNfa(regex) {
        const nfa = []; // State transition table
        const s = [];   // Stack of pairs of states to next consider
        var start = 0;  // ID of start state
        var end = 1;    // ID of accept state
        var count = 0;  // Counter for state IDs
        var c1 = 0;     // ID of a state to add to NFA
        var c2 = 0;     // ID of another state to add to NFA

        // Iterate through each character in the postfix regex
        for (var i=0; i<regex.length; i++) {
            if (regex[i] == '*') { // Kleene star operator
                // Pop last pair of states from stack (sub-NFA)
                var top = s.pop();
                var r1 = top[0]; // start of sub-NFA
                var r2 = top[1]; // end of sub-NFA
                // Set IDs of two new states
                c1 = count++;
                c2 = count++;
                // Push new states onto stack
                s.push([c1, c2]);
                // Add new states to NFA
                nfa.push({});
                nfa.push({});
                for (var char of SIGMA) {
                    nfa[c1][char] = [];
                    nfa[c2][char] = [];
                }
                nfa[c1][EPSILON] = [];
                nfa[c2][EPSILON] = []
                // Loop back to start of sub-NFA or continue
                nfa[r2][EPSILON].push(r1, c2);
                // Go to start of sub-NFA or skip
                nfa[c1][EPSILON].push(r1, c2);
                // Set new start and end states if necessary
                if (start == r1) {
                    start = c1;
                }
                if (end == r2) {
                    end = c2;
                }
            } else if (regex[i] == '.') { // Concatenation operator
                // Pop last two pairs of states from stack (two sub-NFAs)
                var top1 = s.pop();
                var top2 = s.pop();
                var r11 = top1[0];
                var r12 = top1[1];
                var r21 = top2[0];
                var r22 = top2[1];
                // Push 'start' of second pair and 'end' of first pair onto stack
                s.push([r21, r12]);
                // Connect first sub-NFA to second with epsilon transition
                nfa[r22][EPSILON].push(r11);
                // Set new start and end states if necessary
                if (start == r11) {
                    start = r21;
                }
                if (end == r22) {
                    end = r12;
                }
            } else if (regex[i] == '+') { // Or operator
                // Set IDs of two new states and add to NFA
                c1 = count++;
                c2 = count++;
                nfa.push({});
                nfa.push({});
                for (var char of SIGMA) {
                    nfa[c1][char] = [];
                    nfa[c2][char] = [];
                }
                nfa[c1][EPSILON] = [];
                nfa[c2][EPSILON] = []
                // Pop last two pairs of states from stack (two sub-NFAs)
                var top1 = s.pop();
                var top2 = s.pop();
                var r11 = top1[0];
                var r12 = top1[1];
                var r21 = top2[0];
                var r22 = top2[1];
                // Push new states to stack
                s.push([c1,c2]);
                // Traverse to second sub-NFA or first sub-NFA
                nfa[c1][EPSILON].push(r21, r11);
                // Continue from end of first sub-NFA
                nfa[r12][EPSILON].push(c2);
                // Continue from end of second sub-NFA
                nfa[r22][EPSILON].push(c2);
                // Set new start and end states if necessary
                if (start == r11 || start == r21) {
                    start = c1;
                }
                if (end == r22 || end == r12) {
                    end = c2;
                }
            } else { // symbol read
                // Set IDs of two new states and add to NFA
                c1 = count++;
                c2 = count++;
                nfa.push({});
                nfa.push({});
                for (var char of SIGMA) {
                    nfa[c1][char] = [];
                    nfa[c2][char] = [];
                }
                nfa[c1][EPSILON] = [];
                nfa[c2][EPSILON] = []
                // Push new states onto stack
                s.push([c1,c2]);
                // Connect the first state to the second via the symbol
                nfa[c1][regex[i]].push(c2);
            }
        }

        return {
            "table" : nfa,
            "start" : start,
            "end" : end
        }
    }
}

function addNewRegex(userExpr="") {
    userExpr = document.querySelector('.js-userExpr').value;
    if(!userExpr) throw new Error('No regex');
    regularExpression.generate2(userExpr);
    document.querySelector('.js-userExpr').value = '';
    console.log(userExpr);
    regexArr.push(userExpr);
    localStorage.setItem('regexArr', JSON.stringify(regexArr));
}

const regularExpression = new Regex();

function toggleInstructions() {
    // Get the instruction menu element
    var instructionMenu = document.getElementById("instructionMenu");

    // Show the instruction menu by setting its display style to "block"
    instructionMenu.style.display = "block";
}

function closeInstructions() {
    // Get the instruction menu element
    var instructionMenu = document.getElementById("instructionMenu");

    // Hide the instruction menu by setting its display style to "none"
    instructionMenu.style.display = "none";
}


