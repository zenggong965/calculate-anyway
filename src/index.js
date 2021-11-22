import React, { Component } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import {
    createStore,
    combineReducers
    // applyMiddleware
} from "redux";
// import { Provider, connect } from "react-redux";

// import React, { Component } from "https://cdn.skypack.dev/react";
// import ReactDOM from "https://cdn.skypack.dev/react-dom";
// // import "./index.css";
// import {
//     createStore,
//     combineReducers
//     // applyMiddleware
// } from "https://cdn.skypack.dev/redux";
// // import { Provider, connect } from "https://cdn.skypack.dev/react-redux";


// redux 数据

// 默认状态

const defaultState = {
    inputExp: "0",
    isResultCaled: false
}

// action types
const INPUT = "INPUT";
const CALCULATE = "CALCULATE";
const AC = "AC";
const BACKSPACE = "BACKSPACE"

// 替换末尾字符
function replaceLastChar(str, newLastChar) {
    let strCutTail = str.slice(0, str.length - 1)
    let newStr = strCutTail + newLastChar
    return newStr
}

// 判断最后一位是否为数字
function isLastCharNum(str) {
    let strCopy = str;
    let lastCharofStrCopy = strCopy.slice(strCopy.length-1, strCopy.length);
    let numReg = /[0-9]/
    return numReg.test(lastCharofStrCopy)
}

// 判断最后一位是否为计算符号
function isLastCharCalSymbol(str) {
    let strCopy = str;
    let lastCharofStrCopy = strCopy.slice(strCopy.length-1, strCopy.length);
    let calSymbolReg = /\+|\-|×|÷/
    return calSymbolReg.test(lastCharofStrCopy)
}


// 把表达式里的数学运算符号替换成编程运算符号
function mathExptoJSExp(str) {
    let strCopy = str
    strCopy = strCopy.replaceAll("×", "*")
    strCopy = strCopy.replaceAll("÷", "/")
    strCopy = strCopy.replaceAll("%", "/100")
    return strCopy
}


// reducer
const reducer = (state = defaultState, action) => {
    let stateCopy = Object.assign(state);
    let currentExp = stateCopy.inputExp

    switch (action.type) {
        case INPUT:
            
            if (currentExp === "0") {   
                // 如果输入数字
                if (isLastCharNum(action.payload) || action.payload === "(" || action.payload === ")" ) {
                    stateCopy.inputExp = action.payload
                }
                
                else {
                    stateCopy.inputExp = currentExp + action.payload
                }    
            }
                     
            else { 

                // 如果输入运算符号
                if (isLastCharCalSymbol(action.payload)) {
                
                    // 检查当前表达式末尾
                    if (currentExp.slice(currentExp.length-1, currentExp.length) === "+") {                         
                        stateCopy.inputExp = replaceLastChar(currentExp, action.payload) 
                    }

                    else if (currentExp.slice(currentExp.length-1, currentExp.length) === "-") {
                        stateCopy.inputExp = replaceLastChar(currentExp, action.payload)
                    }

                    else {
                        stateCopy.inputExp = currentExp + action.payload
                    }          
                }

                // 如果输入非运算符号
                else {
                    stateCopy.inputExp = currentExp + action.payload
                }          
            } 
            
            return stateCopy;
        
        case CALCULATE:
            stateCopy.inputExp = currentExp + action.payload;
            stateCopy.isResultCaled = !stateCopy.isResultCaled
            return stateCopy;

        case AC:
            stateCopy.isResultCaled = false
            stateCopy.inputExp = "0";
            return stateCopy;
        case BACKSPACE:
            

            if (stateCopy.isResultCaled) {
                let idxOfEqual = currentExp.indexOf("=")
                stateCopy.inputExp = currentExp.slice(0, idxOfEqual)  
            }
            else {
                stateCopy.inputExp = currentExp.slice(0, currentExp.length-1)
                if (stateCopy.inputExp === "") {
                    stateCopy.inputExp = "0"
                }
                else {

                }
            }
            


            stateCopy.isResultCaled = false
            return stateCopy;
        default:
            return stateCopy;
    }
};


const store = createStore(reducer);


// actions, dipatch actions


// 计算函数
function calculateAExp(aMathExp) {
    let currentExp = mathExptoJSExp(aMathExp)
    
    let currentExpCopy = currentExp.slice(0, currentExp.length - 1);
    let calRe;

    calRe = new Function("return " + currentExpCopy);

    let re = calRe();
    let reStr = ""
    
    if (re%1) {     
        re = re.toFixed(4)
        reStr = re.toString()
        reStr = reStr.replace(/0+$/g, "");
    } 
    else {
        reStr = re.toString()
    }    

    return reStr

}


// 计算动作
const calculateResultAct = () => {
    let currentMathExp = store.getState().inputExp;
    let currentIsResultCaled = store.getState().isResultCaled

    if (currentIsResultCaled) {
        return 0
    }
    else {
        let re = calculateAExp(currentMathExp)
        let action = {
            type: CALCULATE,
            payload: re
        };

        store.dispatch(action);
    }

    
};


// 输入动作
const inputThingsAct = (btnValue) => {
    
    let action = {
            type: INPUT,
            payload: btnValue
        };

    let currentExp = store.getState().inputExp;
    let currentIsResultCaled = store.getState().isResultCaled

    let plusMultiplySubReg = /\+|×|÷/

    if (btnValue === "=") {
        
        if (isLastCharCalSymbol(currentExp)) {
            return 0
        }
        else {      
            if (currentIsResultCaled) {
                return 0
            } else {
                store.dispatch(action);
                calculateResultAct()
            }
            
        }   
    }

    // 输入+-×÷ 
    else if (isLastCharCalSymbol(btnValue)) {
        
        // 输入+
        if (btnValue === "+") {
            
            // 表达式结尾为+×÷
            
            if (plusMultiplySubReg.test(currentExp.slice(currentExp.length-1, currentExp.length))) {
                return 0
            }
            
            else {      
                store.dispatch(action);
            }
        }

        // 输入-
        else if (btnValue === "-") {
            if (currentExp.slice(currentExp.length-1, currentExp.length) === "-") {
                return 0
            }
            else {      
                store.dispatch(action);
            }
        }

        // 输入×÷
        else {
            if (isLastCharCalSymbol(currentExp.slice(currentExp.length-1, currentExp.length))) {
                return 0
            }
            else {
                store.dispatch(action);
            }

        }

    }

    // 输入数字
    else {
        store.dispatch(action); 
    }
    
};




// 清空
const allClearAct = () => {
    let action = {
        type: AC
    };

    store.dispatch(action);
};

// 退格
const backSpaceAct = () => {
    let action = {
        type: BACKSPACE
    };

    store.dispatch(action);
}

// ==============

// react UI

// 按键
function CalBtn(props) {
    return (
        <div className="flex-small">
      <button

      className="button muted-button full-button square-button"
      value={props.btnValue}
      onClick={props.onClick}>
    
      {props.btnLabel}
      </button>
    </div>
    );
}

// 按键面板
class KeyBoard extends Component {
    state = {
        displayOnScreen: store.getState().inputExp,
        isResultCaled: store.getState().isResultCaled
    };

    inputThings(event) {
        if (store.getState().isResultCaled) {
            if (event.target.value === "=") {
                return 0
            }
            
            else {
                allClearAct();
                inputThingsAct(event.target.value);
            }
        } 

        else {
            inputThingsAct(event.target.value);
        }
    }

    allClear() {
        allClearAct();
    }

    componentDidMount() {
        store.subscribe(() => {
            console.log(store.getState().isResultCaled)
            this.setState(store.getState().input);
        });
    }

    render() {
        return (
             <div className="keyboard-grid">

                <CalBtn btnLabel={"C"} btnValue={"AC"} onClick={this.allClear}/>
                <CalBtn btnLabel={"("} btnValue={"("} onClick={this.inputThings}/>
                <CalBtn btnLabel={")"} btnValue={")"} onClick={this.inputThings}/>
                <CalBtn btnLabel={"÷"} btnValue={"÷"} onClick={this.inputThings}/>

                <CalBtn btnLabel={"7"} btnValue={"7"} onClick={this.inputThings}/>
                <CalBtn btnLabel={"8"} btnValue={"8"} onClick={this.inputThings}/>
                <CalBtn btnLabel={"9"} btnValue={"9"} onClick={this.inputThings}/>
                <CalBtn btnLabel={"×"} btnValue={"×"} onClick={this.inputThings}/>
                              
                <CalBtn btnLabel={"4"} btnValue={"4"} onClick={this.inputThings}/>
                <CalBtn btnLabel={"5"} btnValue={"5"} onClick={this.inputThings}/>
                <CalBtn btnLabel={"6"} btnValue={"6"} onClick={this.inputThings}/>
                <CalBtn btnLabel={"-"} btnValue={"-"} onClick={this.inputThings}/>

                <CalBtn btnLabel={"1"} btnValue={"1"} onClick={this.inputThings}/>
                <CalBtn btnLabel={"2"} btnValue={"2"} onClick={this.inputThings}/>
                <CalBtn btnLabel={"3"} btnValue={"3"} onClick={this.inputThings}/>
                <CalBtn btnLabel={"+"} btnValue={"+"} onClick={this.inputThings}/>

                <CalBtn btnLabel={"0"} btnValue={"0"} onClick={this.inputThings}/>
                <CalBtn btnLabel={"%"} btnValue={"%"} onClick={this.inputThings}/>
                <CalBtn btnLabel={"."} btnValue={"."} onClick={this.inputThings}/>
                <CalBtn btnLabel={"="} btnValue={"="} onClick={this.inputThings}/>

            
            </div>
        );
    }
}

// 显示屏

class DisplayScreen extends Component {
    state = {
        inputExp: store.getState().inputExp
    };

    componentDidMount() {
        
        store.subscribe(() => {
            console.log(store.getState().inputExp)
            this.setState(store.getState());
        });
    }

    backSpace() {
        backSpaceAct()
    }

    render() {
        return (
            <div className="display-grid">
            <div className="display-screen">
                <p className="display-content">{this.state.inputExp}</p>
                
            </div>
            <CalBtn btnLabel={"←"} btnValue={"←"} onClick={this.backSpace}/>
            </div>
        );
    }
}

// 整个App

class App extends Component {
    render() {
        return (
        <div className="small-container">
            <div align="center"><h3><img width="120" src="https://z3.ax1x.com/2021/11/14/I67tjU.jpg" alt="I67tjU.jpg" border="0" />计算器</h3></div>
            <DisplayScreen />
            <KeyBoard />
            
        </div>
        );
    }
}

// 渲染 ===========

ReactDOM.render(<App />, document.getElementById("root"));