function Controller(sandboxNum) {
	var myInterpreter = null;
	var done = false;
	var intervalID;
	var funcList = [];
	var codeStr;
	var runMode = false;
	var varArr = [];
	var scopeArr = [];
	var thisObj = this;
	var _runButton;
	var _walkButton;
	var figDiv;
	var outputTable;
	var varBox;
	var varTable;
	var haltFlag;
	var lastLine = -1;
	var firstMove = true;
	var nextRowInd = 0;
	var slidDown = false;
	var promptInput = "";
	var promptFlag = false;
	var editCellID;
	var defaultPromptInput;
	var attemptingToRun = false;
	var shiftDown = false;
	var dummyVar = 0;
	var showVarBox = true;
	var showScope = false;
	var figDiv = document.getElementById("fig" + sandboxNum + "Div");
	
	figDiv.innerHTML = '<div id="selector" style="text-align:center"></div> \
		 <h4 id="codeTitle">Code Window</h4> \
		 <div> \
		 <div id="programCode"> \
			<table id="fig' + sandboxNum + 'Editor"></table> \
		 </div> \
		 <div id="buttons"> \
			<div><button id="fig' + sandboxNum + 'AddVar"        type="button">Variable</button></div> \
			<div><button id="fig' + sandboxNum + 'AddArr"        type="button" onclick="figure.getEditor().addVariable("array")">Array</button></div> \
			<div><button id="fig' + sandboxNum + 'AddFunc"       type="button" onclick="figure.getEditor().addFunction()">Declare Function</button></div> \
			<div><button id="fig' + sandboxNum + 'Assign"        type="button" onclick="figure.getEditor().addOneLineElement("assignment")">Assign</button></div> \
			<div><button id="fig' + sandboxNum + 'Write"         type="button" onclick="figure.getEditor().addOneLineElement("write")">Write</button></div> \
			<div><button id="fig' + sandboxNum + 'Writeln"       type="button" onclick="figure.getEditor().addOneLineElement("writeln")">Writeln</button></div> \
			<div><button id="fig' + sandboxNum + 'StringPrompt"  type="button" onclick="figure.getEditor().addOneLineElement("stringPrompt")">String Prompt</button></div> \
			<div><button id="fig' + sandboxNum + 'NumericPrompt" type="button" onclick="figure.getEditor().addOneLineElement("numericPrompt")">Numeric Prompt</button></div> \
			<div><button id="fig' + sandboxNum + 'While"         type="button" onclick="figure.getEditor().addWhile()">While</button></div> \
			<div><button id="fig' + sandboxNum + 'AddFor"        type="button" onclick="figure.getEditor().addFor()">For</button></div> \
			<div><button id="fig' + sandboxNum + 'AddIfThen"     type="button" onclick="figure.getEditor().addIfThen()">If...Then</button></div> \
			<div><button id="fig' + sandboxNum + 'AddIfElse"     type="button" onclick="figure.getEditor().addIfElse()">If...Else</button></div> \
			<div><button id="fig' + sandboxNum + 'FuncCall"      type="button" onclick="figure.getEditor().addOneLineElement("functionCall")">Call Function</button></div> \
			<div><button id="fig' + sandboxNum + 'Return"        type="button" onclick="figure.getEditor().addOneLineElement("return")">Return</button></div> \
		 </div> \
	</div> \
    <div id="fig1OutVarBox" class="outterDiv"> \
      <h4 id="varTitle">Variables</h4> \
	  <div id="fig1VarBox" class="varDiv"> \
		<table id="varTable"></table> \
	  </div> \
   </div> \
   <div class="outterDiv"> \
		<h4 id="outTitle">Output</h4> \
		<div id="outputBox" class="varDiv"> \
			<table id="outputTable"></table> \
		</div> \
   </div> \
   <div id="runWalk" align="center"> \
      <button type="button" onClick="figure.runButton()">Run</button> \
      <button type="button" onClick="figure.walkButton()">Walk</button> \
   </div>';
   
   	var editorTable = document.getElementById("fig" + sandboxNum + "Editor");
	var editor = new Editor(sandboxNum);
	
	this.walkButton = walkButton;
	this.runButton = runButton;
	this.updateVariables = updateVariables;
	
	var addVarButton = document.getElementById("fig" + sandboxNum + "AddVar");
	var addArrButton = document.getElementById("fig" + sandboxNum + "AddArr");
	var addFuncButton = document.getElementById("fig" + sandboxNum + "AddFunc");
	var assignButton = document.getElementById("fig" + sandboxNum + "Assign");
	var writeButton = document.getElementById("fig" + sandboxNum + "Write");
	var writelnButton = document.getElementById("fig" + sandboxNum + "Writeln");
	var stringPromptButton = document.getElementById("fig" + sandboxNum + "StringPrompt");
	var numericPromptButton = document.getElementById("fig" + sandboxNum + "NumericPrompt");
	var whileButton = document.getElementById("fig" + sandboxNum + "While");
	var forButton = document.getElementById("fig" + sandboxNum + "AddFor");
	var ifThenButton = document.getElementById("fig" + sandboxNum + "AddIfThen");
	var ifElseButton = document.getElementById("fig" + sandboxNum + "AddIfElse");
	var funcCallButton = document.getElementById("fig" + sandboxNum + "FuncCall");
	var returnButton = document.getElementById("fig" + sandboxNum + "Return");
	
	addVarButton.onclick = function () { editor.addVariable("variable"); };
	addArrButton.onclick = function () { editor.addVariable("array"); };
	addFuncButton.onclick = function () { editor.addFunction(); };
	assignButton.onclick = function () { editor.addOneLineElement("assignment"); };
	writeButton.onclick = function () { editor.addOneLineElement("write"); };
	writelnButton.onclick = function () { editor.addOneLineElement("writeln"); };
	stringPromptButton.onclick = function () { editor.addOneLineElement("stringPrompt"); };
	numericPromptButton.onclick = function () { editor.addOneLineElement("numericPrompt"); };
	whileButton.onclick = function() { editor.addWhile(); };
	forButton.onclick = function() { editor.addFor(); };
	ifThenButton.onclick = function() { editor.addIfThen(); };
	ifElseButton.onclick = function() { editor.addIfElse(); };
	funcCallButton.onclick = function () { editor.addOneLineElement("functionCall"); };
	returnButton.onclick = function () { editor.addOneLineElement("return"); };
	
	$(document).ready(function() {
            $("#fig" + sandboxNum + "OutVarBox").hide(); 
	 });
	
	function init(interpreter, scope) {
		var wrapper = function (text) {
			text = text ? text.toString() : '';
			return interpreter.createPrimitive(alert(text));
		};
		interpreter.setProperty(scope, 'alert', interpreter.createNativeFunction(wrapper));

		var wrapper2 = function (text1, text2) {
			text1 = text1 ? text1.toString() : '';
			text2 = text2 ? text2.toString() : '';
			//return interpreter.createPrimitive(promptFunc(text1, text2));
			return interpreter.createPrimitive(stopPrompt())
		}
		interpreter.setProperty(scope, 'prompt', interpreter.createNativeFunction(wrapper2));

		var wrapper3 = function (text) {
			text = text ? text.toString() : '';
			//return interpreter.createPrimitive(outputTable.value += text);
			return interpreter.createPrimitive(outputWrite(text));
		};
		interpreter.setProperty(scope, 'document1write', interpreter.createNativeFunction(wrapper3));

		var wrapper4 = function (text) {
			text = text ? text.toString() : '';
			//return interpreter.createPrimitive(outputTable.value += text + "\n");
			return interpreter.createPrimitive(outputWriteln(text));
		};
		interpreter.setProperty(scope, 'document1writeln', interpreter.createNativeFunction(wrapper4));

		var wrapper5 = function () {	
			//return interpreter.createPrimitive(outputTable.value += text + "\n");
			return interpreter.createPrimitive(dummyVar++);
		};
		interpreter.setProperty(scope, 'dummyFunction', interpreter.createNativeFunction(wrapper5));
	};
	
	function outputWrite(text) {
		var cell = outputTable.rows[outputTable.rows.length - 1].cells[0];
		cell.setAttribute("style", "height:15px");
		cell.textContent += text;
	}
	
	function outputWriteln(text) {
		if (text == " ") text = " ";
		var cell = outputTable.rows[outputTable.rows.length - 1].cells[0];
		cell.setAttribute("style", "height:1em");
		cell.textContent += text;
		var row = outputTable.insertRow(outputTable.rows.length);
		row.insertCell(0);
	}
	
	function stopPrompt() {
		var temp = promptInput;
		promptInput = "";
		return temp;
	}

	function promptFunc(promptType, promptStr, defaultStr) {
		var cell = outputTable.rows[outputTable.rows.length - 1].cells[0];
		cell.setAttribute("style", "height:1em");
		cell.textContent += promptStr.slice(1, promptStr.length - 1);
		var row = outputTable.insertRow(outputTable.rows.length);
		row.insertCell(0);
		cell.contentEditable = false;
		
		cell = outputTable.rows[outputTable.rows.length - 1].cells[0];
		cell.style.color = "red";
		cell.contentEditable = true;

		var id = "fig" + sandboxNum + "TD" + (outputTable.rows.length - 1);
		cell.setAttribute("id", id);
		cell.setAttribute("type", "number");
		editCellID = id;
		
		if (defaultStr.charAt(0) == '"') {
			if (defaultStr.length == 2) defaultPromptInput = "";
			else defaultPromptInput = defaultStr.slice(1, defaultStr.length - 1);
		}
		else defaultPromptInput = defaultStr;
		
		if (promptType == "numeric") setupNumericPrompt(id);
		else setupStringPrompt(id);
		
		$('#' + id).focus();
		row = outputTable.insertRow(outputTable.rows.length);
		row.insertCell(0);
		
		return promptInput;
	}
	
	function setupNumericPrompt(id) {
		$("#" + id).keyup(function (event) {
			var code = event.which || event.keyCode;
			if (code == 16) {
				shiftDown = false;	// since this is key up, shift down is now false
			}
			
			promptInput = document.getElementById(id).textContent;	// update the prompt input upon each key up
		});
	
		$("#" + id).keydown(function (event) {
			var code = event.which || event.keyCode;
			if (code == 16) {
				shiftDown = true;	// shift key, don't allow anything while this is held down
			}
			else if (code == 8 || (code >= 37 && code <= 57) || (code >= 96 && code <= 105)) {
				// allow this
			}
			else if (code == 109 || code == 189 || code == 173) {	// a dash (negative number possibility)
				if (promptInput.length != 0) { event.preventDefault(); return; } // only allow a dash at the 0 index position
			}
			else if (code == 110 || code == 190) {	// a period was pressed for a decimal point
				if (promptInput.indexOf(".") >= 0) { event.preventDefault(); return } // a decimal point already exists; there can't be another
				else { /* allow it go through; do nothing */ }
			}
			else if (code == 10 || code == 13) {
				// enter key, allow it for now (will be caught by key press)
			}
			else event.preventDefault();
		});
	
		$("#" + id).keypress(function (event) {
			var cell = document.getElementById(id);
			var code = event.which || event.keyCode;
			if (shiftDown == true) {
				event.preventDefault();	// if shift is down, ignore the key regardless of key code
				return;
			}	
			
			if (code == 10 || code == 13) {	// enter key was pressed
				event.preventDefault();
				if (cell.textContent == "" || cell.textContent.length == 0) {
					promptInput = defaultPromptInput;
					cell.textContent += defaultPromptInput;
					//alert("You should probably enter some input first!");
					//return;
				}
				
				cell.contentEditable = false;
				promptFlag = false;
				
				if (runMode == true || attemptingToRun == true) { attemptingToRun = false; runMode = false; runButton(); }
				else { walkButton(); }
			}
		});
	}
	
	function setupStringPrompt(id) {
		$("#" + id).keyup(function (event) {	
			promptInput = document.getElementById(id).textContent;	// update the prompt input upon each key up
		});
	
		$("#" + id).keydown(function (event) {
			var code = event.which || event.keyCode;
			if (code == 10 || code == 13) {
				// enter key, allow it for now (will be caught by key press)
			}
		});
	
		$("#" + id).keypress(function (event) {
			var cell = document.getElementById(id);
			var code = event.which || event.keyCode;	
			
			if (code == 10 || code == 13) {	// enter key was pressed
				event.preventDefault();
				if (cell.textContent == "" || cell.textContent.length == 0) {
					promptInput = defaultPromptInput;
					cell.textContent += defaultPromptInput;
					//alert("You should probably enter some input first!");
					//return;
				}
				
				cell.contentEditable = false;
				promptFlag = false;
				
				if (runMode == true || attemptingToRun == true) { attemptingToRun = false; runMode = false; runButton(); }
				else { walkButton(); }
			}
		});
	}
	
	function appendOutput(question, text) {
		var cell = outputTable.rows[outputTable.rows.length - 1].cells[0];
		cell.setAttribute("style", "height:1em");
		cell.textContent += question;
		var row = outputTable.insertRow(outputTable.rows.length);
		row.insertCell(0);
		
		cell = outputTable.rows[outputTable.rows.length - 1].cells[0];
		cell.setAttribute("style", "height:1em");
		cell.innerHTML += "<font color='red'><b><i>" + text + "</b></i></font>";
		row = outputTable.insertRow(outputTable.rows.length);
		row.insertCell(0);
	}

	function parseButton() {
		var code = document.getElementById('code').value
			myInterpreter = new Interpreter(code, init);
		disable('');
	}
	
	function walkButton() {
		slideVarBox("down");
		
		var text = editor.getEditorText();
		console.log(text);
		
		return;
		if (done == true) { reset(); return; }
		if (attemptingToRun == true || runMode == true) {
			outputTable.innerHTML = "";
			varTable.innerHTML = "";
			slideVarBox("up");
			reset();
			return;
		}
		
		//if (checkIfPrompt(true) == true) return;
		var editCell = document.getElementById(editCellID);
		if (promptFlag == true && promptInput.length == 0) {
			promptInput = defaultPromptInput;
			if (editCell) editCell.textContent += promptInput;
			promptFlag = false;
		}
		else promptFlag = false;
		
		if (editCell) editCell.contentEditable = false;
		
		slideVarBox("down");
		
		if (myInterpreter === null) myInterpreter = new Interpreter(codeStr, init, thisObj);
		if (runMode == true) {
			clearInterval(intervalID);
			runMode = false;
			_runButton.textContent = "Run";
			slideVarBox("down");
			return;
		}
		while (walk() == false) { }
	}
	
	function runButton() {
		slideVarBox("up");
		return;
		
		if (done) reset();
	
		if (runMode == true) {
			clearInterval(intervalID);
			_runButton.textContent = "Run";
			_runButton.style.backgroundColor = green; 
			_walkButton.textContent = "Walk";
			_walkButton.style.backgroundColor = orange;
			runMode = false;
			slideVarBox("down");
			
			return;
		}
		else {
			if (attemptingToRun == false && checkIfPrompt() == true) {
				$("#" + editCellID).focus();
				attemptingToRun = true;
				_runButton.textContent = "Pause";
				_runButton.style.backgroundColor = orange;
				_walkButton.textContent = "Reset";
				_walkButton.style.backgroundColor = red;
				return;
			}
			else if (attemptingToRun == true && checkIfPrompt() == true) {
				attemptingToRun = false;
				_runButton.textContent = "Run";
				_runBotton.style.backgroundColor = green;
				_walkButton.textContent = "Walk";
				_walkButton.style.backgroundColor = orange;
				slideVarBox("down");
				return;
			}
			else if (attemptingToRun == true) {
				attemptingToRun = false;
				_runButton.textContent = "Run";
				_runButton.style.backgroundColor = green;
				_walkButton.textContent = "Walk";
				_walkButton.style.backgroundColor = orange;
				runMode = false;
				slideVarBox("down");
				return;
			}
		}
		
		_walkButton.textContent = "Reset";
		_walkButton.style.backgroundColor = red;
		_runButton.textContent = "Pause";
		_runButton.style.backgroundColor = orange;
		if (myInterpreter === null) myInterpreter = new Interpreter(codeStr, init, thisObj);
		
		runMode = true;
		intervalID = setInterval(walk, 100);
	}
	
	function slideVarBox(dir) {
		if (showVarBox == false) return;
		
		if (!slidDown && dir == "down") {
			$("#fig" + sandboxNum + "OutVarBox").slideDown("medium", function() {
				//varBox.scrollTop = varBox.scrollHeight;
				slidDown = true;
			});
		}
		else if (slidDown && dir == "up") {
			$("#fig" + sandboxNum + "OutVarBox").slideUp("medium");
			slidDown = false;
		}
	}
	
	function walk() {
		var res;
		var node;
		var start;
		var end;
		var flag = false;
		var status;
		
		if (done == true) {
			_runButton.textContent = "Run";
			reset();
			return true;
		}
		
		if (firstMove == true) {
			outputTable.innerHTML = "";
			var row = outputTable.insertRow(0);
			row.insertCell(0);
			
			clearTable();
			firstMove = false;
		}

		while (flag == false) {
			var promptRes = editor.checkPromptFlag();
			if (promptRes[0] == true) {
				promptFunc(promptRes[1], promptRes[2], promptRes[3]);
				haltFlag = true;
				promptFlag = true;
				if (runMode == true) clearInterval(intervalID);
			}
			
			if (myInterpreter.step() == false) {
				flag = true;
				done = true;
				start = -1;
				end = -1;
			}
			else {
				pollVariables();

				if (myInterpreter.stateStack[0]) {
					node = myInterpreter.stateStack[0].node;
					start = node.start;
					end = node.end;
				}
			}
			
			status = editor.isNewLine(start, end);
			if (haltFlag == true) {
				editor.selectLine(status[1]);
				haltFlag = false;
				break;
			}
			else {
				if (status[0] == true) {
					editor.selectLine(status[1]);
					flag = true;
				}
			}
			
		}

		outputBox.scrollTop = outputBox.scrollHeight;
		varBox.scrollTop = varBox.scrollHeight;

		return true;
	}

	function checkIfPrompt() {
		if (promptFlag == true && (promptInput == "" || promptInput.length == 0)) {
			$('#' + editCellID).focus();
			return true;
		}
		else if (promptFlag == true && promptInput != "") {
			promptFlag = false;
			return false;
		}
	}
	
	function reset() {
		_runButton.textContent = "Run";
		_runButton.style.backgroundColor = green;
		_walkButton.textContent = "Walk";
		_walkButton.style.backgroundColor = orange;
		promptFlag = false;
		haltFlag = false;
		attemptingToRun = false;
		done = false;
		runMode = false;
		varArr = [];
		scopeArr = [];
		clearInterval(intervalID);
		myInterpreter = null;
		editor.reset();
		firstMove = true;
	}
	
	function updateVariables(mode, scope, leftValue, rightValue) {
		var found = false;
		if (mode == "add") {
			for (var i = 0; i < varArr.length; i++) {
				if (scope == varArr[i][0] && (varArr[i][1] == leftValue || varArr[i][1].data == leftValue)) {
					if (varArr[i].length == 2) varrArr[i].push(rightValue);
					else varArr[i][3] = rightValue;
					found = true;
					break;
				}
			}
			if (!found) {
				var dataType = editor.getDatatypeSelectedLine();
				if (dataType === null) dataType = (isString(rightValue)) ? "text" : "numeric";
				
				if (leftValue.data && rightValue.data) varArr.push([scope, leftValue.data, dataType, rightValue.data]);
				else if (leftValue.data) varArr.push([scope, leftValue.data, dataType, rightValue]);
				else if (rightValue.data) varArr.push([scope, leftValue, dataType, rightValue.data]);
				else varArr.push([scope, leftValue, dataType, rightValue]);
				
				if (!scopeExists(scope)) scopeArr.push(scope);
			}
		}
		else {
			for (var i = 0; i < varArr.length; i++) {
				if (scope == varArr[i][0] && (varArr[i][1] == leftValue || varArr[i][1].data == leftValue)) {
					//var scopeNum = getScopeNum(varArr[i][0]);
					//if (scopeNum != -1) scopeArr.splice(scopeNum, 1);
					var scope = varArr[i][0];
					varArr.splice(i, 1);
				}
			}
		}
		
		updateTable();
	}
	
	function pollVariables() {
		var scopeNum;
		try {
			scopeNum = getScopeNum(myInterpreter.getScope());
		}
		catch (err) {
			return;
		}
		
		var count = 0;
		if (scopeNum < 0) return;
		
		for (var i = 0; i < varArr.length; i++) {
			if (getScopeNum(varArr[i][0]) > scopeNum) { updateVariables("del", varArr[i][0], varArr[i][1]); haltFlag = true; }
		}
	}
	
	function getScopeNum(scope) {
		for (var i = 0; i < scopeArr.length; i++) if (scopeArr[i] == scope) return i;
		return -1;
	}
	
	function scopeExists(scope) {
		for (var i = 0; i < scopeArr.length; i++) if (scopeArr[i] == scope) return true;
		return false;
	}
	
	function clearTable() {
		varTable.innerHTML = "";
		return;
	}
	
	function updateTable() { 
		varTable.innerHTML = "";
		var row;
		var cell;
		var scopeNum;
		
		if (showScope) {
			row = varTable.insertRow(0);
			for (var i = 0; i < 4; i++) {
				cell = row.insertCell(i);
				if (i == 0) cell.textContent = "level";
				else if (i == 1) cell.textContent = "variable";
				else if (i == 2) cell.textContent = "type";
				else cell.textContent = "value";
			}

			
			for (var i = 0; i < varArr.length; i++) {
				row = varTable.insertRow(i + 1);
				for (var j = 0; j < 4; j++) {
					scopeNum = getScopeNum(varArr[i][0]);
					if (scopeNum < 0) {
						varArr.splice(i, 1);
						break;
					}
					cell = row.insertCell(j);
					if (j == 0) cell.textContent = getScopeNum(varArr[i][0]);
					else if (j == 1) cell.textContent = varArr[i][1];
					else if (j == 2) cell.textContent = varArr[i][2];
					else cell.textContent = varArr[i][3];
				}
			}
		}
		else {
		
			row = varTable.insertRow(0);
			for (var i = 0; i < 3; i++) {
				cell = row.insertCell(i);
				if (i == 0) cell.textContent = "variable";
				else if (i == 1) cell.textContent = "type";
				else cell.textContent = "value";
			}
			
			for (var i = 0; i < varArr.length; i++) {
				row = varTable.insertRow(i + 1);
				for (var j = 0; j < 3; j++) {
					scopeNum = getScopeNum(varArr[i][0]);
					if (scopeNum < 0) {
						varArr.splice(i, 1);
						break;
					}
					cell = row.insertCell(j);
					if (j == 0) cell.textContent = varArr[i][1];
					else if (j == 1) cell.textContent = varArr[i][2];
					else cell.textContent = varArr[i][3];
				}
			}
		}
	}
	
	var toString = Object.prototype.toString;

	isString = function (obj) {
		return toString.call(obj) == '[object String]';
	}
	
	this.getEditor = getEditor;
	function getEditor() { return editor; }
	
}
