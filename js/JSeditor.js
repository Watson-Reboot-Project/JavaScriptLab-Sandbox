/***********************************************************************************
* Author:	Neil Vosburg
* File:		editor.js
*
*			This is the beginnings of an editor for the JavaScript lab. Its purpose
*			is to mimic Watson as it is now.
************************************************************************************/

function JSEditor(sandboxNum) {
	
	var editor = new Editor("programCode", true, true, 1, -1, true);
	
	var variableCount = 0;									// keeps count of the amount of variables
	var funcCount = 0;										// keeps count of number of functions
	var programStart = 0;									// the line the main program starts
	var programCount = 0;
	var firstMove = false;									// keeps track if the user has added something to the main program
	var indent = "&nbsp;&nbsp;&nbsp;"						// indention used for inside brackets
	
	var functionList = [];									// an array of currently declared functions
	var promptFlag = [];
	var rowNum;
	
	var rowType = [];
	var dummyRows = [];
	var lineNums = [];
	var charCountStart = [ ];
	var charCountEnd = [ ];
	var codeStrLen;
	
	/* Weston variables */
	var vFuns = [];
	var nFuns = [];
	var tFuns = [];
	var ftypes = ["Text", "Numeric", "Void"];
	var vtypes = ["Text", "Numeric"];
	var nvars = [];
	var tvars = [];
    var wtypes = ["text", "numeric"];
	var resWords = ["new", "this", "var", "ID", "list", "Array", "function", ""];
	var namesUsed = [];
	var namesRef = [];
    var compKeys = ["while", "if"];
    var nExpr = ["numeric constant", "numeric variable", "numeric function call", "EXPR"];
    var tExpr = ["text constant", "text variable", "text function call", "EXPR + EXPR"];
    var nExprtypes = ["EXPR + EXPR", "EXPR - EXPR", "EXPR * EXPR", "EXPR / EXPR", "EXPR % EXPR", "(EXPR)"];
    var btypes = ["EXPR == EXPR", "EXPR != EXPR", "EXPR > EXPR", "EXPR >= EXPR", "EXPR < EXPR", "EXPR <= EXPR"];
	//var innerTablet;
	var clickRow;
	var clickedCell;
    var clickedCellNum;
	var dial = document.getElementById('selector');
	var dialOKButton;
	var dialCancelButton;
	
	this.addVariable = addVariable;
	this.addFunction = addFunction;
	this.addOneLineElement = addOneLineElement;
	this.addWhile = addWhile;
	this.addFor = addFor;
	this.addIfThen = addIfThen;
	this.addIfElse = addIfElse;
	this.selectLine = selectLine;
	this.getDatatypeSelectedLine = getDatatypeSelectedLine;
	this.isNewLine = isNewLine;
	this.checkPromptFlag = checkPromptFlag;
	this.reset = reset;
	
	init();					// initialize some important stuff

	// init() .... it initializes some important stuff .. o_0
	function init() {
		var row;
		var cell;
		var innerTable;

		// iterate twice
		for (var i = 0; i < 3; i++) {
			// depending on the iteraton, we do different things
			if (i == 0) {
				editor.addRow(i,
					[{text:"//&nbsp;", type:"comment"},
					{text:"Scratch Pad", type:"comment"}]);
			}	// first iteration: add "// Scratch Pad" to the first row, style it
			else if (i == 1){
				editor.addRow(i,
					[{text:"&nbsp;"}]);
			}
			else if (i == 2) {
				editor.addRow(i,
					[{text:"//&nbsp;", type:"comment"},
					{text:"Main Program", type:"comment"}]);
			}
		}

		//addNewInsertRow();
		// make a blank row where the program starts (this could have been in the for loops above)
		//row = codeTable.insertRow(3);	// make a new row
		//cell = row.insertCell(0);		// make a new cell here
		//cell.innerHTML = innerTableArrowTemplate;	// set the cell with arrow template
		programStart = 3;				// increate the program start to 2
		//selRow = 3;						// selected row is line 2
		programCount = 3;
		//refreshLineCount();				// refresh the line count along the left margin
	}

	// all this does is initialize the jQuery UI dialog
	$("#selector").dialog({
			modal: false,
			autoOpen: false,
			height: 200,
			width: 175,
			position:[300,20],
			open: function (event, ui) {
					$('#selectDialog').css('overflow', 'hidden'); //this line does the actual hiding
			}
	});

	editor.setCellClickListener(function(event){
		event.stopPropagation();
	//console.log("remember this test? selRow is: " + selRow);
		//a few helpful variables
		var selRow = editor.getSelectedRowIndex();
		var programCount = editor.getRowCount();

		//if we clicked on the insert bar
		if($(this).hasClass("insertprogramCode")){
			//console.log("in insert code");
			// Grab the the row number so as to edit the editor
			var insertRowNum = $(this).parent().index();
			// Increase the insertRowNum because we want to enter the new statement
			// in the next line in the code window.
			//insertRowNum++;
			/*
			if (selRow-1 == insertRowNum) {
					return;
			}
							
			// Move to the bottom of the editor
			if (insertRowNum > programCount) {
					//moveToLine(programCount);
					editor.selectRowByIndex(programCount);
					return;
			}
			
			// Condition to ensure the insertion is done only at the bottom of the row
			if (editor.rowToArray(insertRowNum).length == 0) {
					return;
			}
			
			// Grab the inner table from the code window
			//try {
			//		var innerTable = codeTable.rows[insertRowNum].cells[0].children[0];
			//		var cellTwoText = innerTable.rows[0].cells[2].innerText;
			//} catch(e) {
			//		console.log(e);	
			//}
			
			//Check to see if this is a valid position
			if (!(checkValidRow(editor.rowToArray(insertRowNum), insertRowNum) || checkValidRow(editor.rowToArray(insertRowNum+1), insertRowNum+1))) {		
					return;		
			}
			*/
			
			//since the editor checks to see if the insert cursor is on the line
			// we are trying to select, all of the logic we need should be taken
			// care of in the insertion bar cursor logic
			editor.selectRowByIndex(insertRowNum, true);
			console.log('\there21');
			
			/*
			// If all condition is passed move to the specified line
			if (insertRowNum > selRow) {
					//moveToLine(insertRowNum-1);
					editor.selectRowByIndex(insertRowNum);
			}
			else{
					//moveToLine(insertRowNum);
					editor.selectRowByIndex(insertRowNum+1);
			}*/
		}
		//if we clicked anywhere else, probably on the code table
		else{
			var cellVal = $(this).text();					// grab the cell value of clicked cell
			var cellNum = $(this).index();					// grab the cell number of clicked cell
			var rowNum = ($(this).parent().parent().parent().parent().parent().index());	// grab row number in codeTable of clicked cell
			console.log("rowNum: " + rowNum + " cellNum: " + cellNum + " cellVal: " + cellVal);
			/* Weston variables */
			//innerTablet = codeTable.rows[rowNum].cells[0].children[0];
			//clickedCell = innerTablet.rows[0].cells[cellNum];
			clickRow = editor.rowToArrayHtml(rowNum);
			clickedCell = $(this);
			clickedCellNum = cellNum;
			
			if(clickRow.length <= 0)
				return;
			
			// if we click the number of the line (very left cell in each row), we try to delete something
			if (cellNum == 0) {
				//var innerTable = codeTable.rows[rowNum].cells[0].children[0];
				//var row = innerTable.rows[0].cells[2].innerHTML;

				// Users are not allowed to delete some specific rows
				// Example a)Empty Rows b)Comments c)Curly Braces
				
				console.log(clickRow);
				if (rowNum < 2 || clickRow[0] == '&nbsp;' || clickRow[0] == '//&nbsp;' || clickRow.indexOf('{') >= 0 || clickRow.indexOf('}') >= 0 || clickRow[1] =='else') {
					return;
				}
				// User should not be able to delete else statement because it is a part of if function
				//else if (rowContainsString(codeTable, rowNum, "else"))
				//	return;
				else {
					// If the next line has '{' then the whole block should be deleted
					if (rowNum != (editor.getRowCount() - 1) && editor.rowToArray(rowNum+1).indexOf('{') >= 0)	{
						// To determine if the selected row is inside the code block or not.
						var isSelRowInside = false;
						
						// isFunction determines if the current row being deleted is a function or not
						// to remove the trailing empty row.
						var isFunction = false;
						var funcName = "";
						// If the row contains the keyword function
						// Decrease the function count
						
						var bracketFound = 0;

						if (clickRow[0] == "function") {
							funcCount--;
							funcName = clickRow[2];
							isFunction = true;
						}

						// Initialize the tableRowCount to 0 because
						// we are iterating starting at the rowNum.
						// This tableRowCount keeps track of the number of rows inside the code block.
						var tableRowCount = 0;

						// Iterate throughout the table, starting at rowNum
						// Exit when '}' is found
						var i = rowNum;
						for (; i < editor.getRowCount(); i++) {
							console.log("\tbrackFound: " + bracketFound);
							// Increase the tableRowCount
							tableRowCount++;
							
							var innerRow = editor.rowToArrayHtml(i);
							console.log("\t", innerRow);

							// If the selected row is inside this current function
							// set isSelRowInside to true and continue.
							if(editor.getSelectedRowIndex() == i) {
								isSelRowInside = true;
								continue;
							}
							
							// To remove the codeblock within a code block
							if (innerRow.indexOf("{") >= 0) {
								bracketFound++;
							}
							// If matching '}' is found then exit out
							else if (innerRow.indexOf("}") >= 0) {
								if (bracketFound > 0) {
									bracketFound--;

									if ((i+1) < editor.getRowCount() && editor.rowToArrayHtml(i+1)[1] == "else") {
											continue;
									}
									if (bracketFound == 0) {
										break;
									}
								}
							}
						}

						// If the selRow is inside the code block
						// move the selRow to the end of the program before deleting the rows.
						if (isSelRowInside) {
							//moveToLine(i);
							editor.selectRowByIndex(i);
							// Reduce the tableRowCount because selecting another row automatically deletes the current row.
							tableRowCount--;
							//isSelRowInside = false;
						}
						
						// Now start deleting the rows starting at rowNum
						for (var i = 1; i <= tableRowCount; i++) {
							deleteOneLineElement(rowNum);
						}

						// If we are removing a function then also delete the trailing empty row
						if (isFunction) {
							//if the selected row was inside the function, move it to the end
							if(isSelRowInside){
								editor.selectRowByIndex(editor.getRowCount()-1, false);
							}
							
							//if there are no more functions, delete "// Functions" and the extra line between the comment and the rest of the program
							if(funcCount == 0){
								deleteOneLineElement(rowNum-1);
								deleteOneLineElement(rowNum-1);
							}
							//else, only delete the extra line between functions
							else{
								deleteOneLineElement(rowNum);
							}
							
							//remove from function list
							if(vFuns.indexOf(funcName) >= 0)
								vFuns.splice(vFuns.indexOf(funcName), 1);
							if(nFuns.indexOf(funcName) >= 0)
								nFuns.splice(nFuns.indexOf(funcName), 1);
							if(tFuns.indexOf(funcName) >= 0)
								tFuns.splice(tFuns.indexOf(funcName), 1);

							isFunction = false;
						}
					}
					// This section basically removes the one one line element.
					else {
						// If the deleted row contains "var" then a variable is being removed from the table
						// subtract 1 from the variableCount
						if (clickRow.indexOf("var") >= 0) {
							//var innerTable = codeTable.rows[rowNum].cells[0].children[0];
							// Grab the variable name
							//var cellContent = innerTable.rows[0].cells[4].textContent;
							// Grab the variable type
							//var cellContentType = innerTable.rows[0].cells[7].textContent;
							
							var varName;
							var varType;
							
							//if row[0] is var, then this is a global variable
							if(clickRow[0] == "var"){
								varName = clickRow[2];
								varType = clickRow[5];
							}
							//else this is a function variable
							else{
								varName = clickRow[3];
								varType = clickRow[6];
							}

							//console.log("\there7 " + varName + " " + (varName !== "ID"));
							if (varName != "ID" && referenceCheck(varName, rowNum)) {
								 createAlertBox("Notice", "You must not reference this variable if you want to delete it", true, null);
									return;
							}

							//console.log("\there8");
							// If we are removing a text variable then remove the variable from the text variable list
							if (varType === "TEXT") {
									var index = tvars.indexOf(varName);
									tvars.splice(index, 1);
							}
							// If we are removing a numeric variable then remove the variable from the numeric variable list
							if (varType === "NUMERIC") {
									var index = nvars.indexOf(varName);
									nvars.splice(index, 1);
							}
							variableCount--;
							// Delete the current row
							//deleteOneLineElement(rowNum);
							deleteOneLineElement(rowNum);
							
							//console.log("\there9 " + variableCount);
							
							// Remove the variable comment if no variable exists
							if (variableCount == 0) {
								// We have to iterate twice to remove the empty space
								// which is at the bottom of the variable section.
								for (var i = 1; i <= 2; i++) {
								//console.log("\there10");
									// Delete the second row because the variable comment if exists
									// is always at row 2.
									deleteOneLineElement(2);
								}
							}
						} else{
							// Delete the current row	
							deleteOneLineElement(rowNum);
						}
					}
				}

				// Conditions to move the selRow either in or out of the code block
				/*var innerTable = codeTable.rows[rowNum-1].cells[0].children[0];
				if (innerTable.rows[0].cells.length == 2 || innerTable.rows[0].cells[2].innerHTML == "/*&nbsp;") {
					moveToLine(programCount);
				}
				refreshLineCount();
				*/
				//editor.selectRowByIndex(rowNum-1,false);
				
				return;
			}

			if (editor.getSelectedRowIndex() == rowNum) return;			// the selected row was clicked? do nothing
			if (rowNum < variableCount) return;		// we don't allow users to move into variables section

			// if the cell value is a blank (5 non-breaking spaces '\xA0'), we try to move to that location
		/*			if (cellVal == '\xA0\xA0\xA0\xA0\xA0') {
				var innerTable = codeTable.rows[rowNum].cells[0].children[0];		// grab the inner table of this row
				if (checkValidRow(innerTable.rows[0], rowNum) == false) return;		// check to see if this is a valid position
				moveToLine(rowNum);												// move to line if we make it here
			}
		*/
			//reset the cellNum and subtract 2 to work with editor.rowToArray()
			cellNum = $(this).index() - 2;
			clickedCellNum = cellNum;
		
			/* Weston's dialogs */
			if (cellVal == 'TYPE' || cellVal == 'TEXT' || cellVal == 'NUMERIC' || cellVal == 'VOID')
			{
				if (clickRow[cellNum-7] == 'function')
				{
					console.log("looking at a function type");
					if (foundIn(clickRow[cellNum-5], namesRef))
					{
						console.log("Can't change type. Is reffed.\n");
					}
					else
					{
						console.log("not reffed.");
						if (foundIn(clickRow[cellNum-5], namesUsed))
						{
							console.log("used.");
							delN(clickRow[cellNum-5], nFuns);
							delN(clickRow[cellNum-5], tFuns);
							delN(clickRow[cellNum-5], vFuns);
							delN(clickRow[cellNum-5], namesUsed);
							createSelector("Select Type", ftypes, ftypeConfirm);
		//                            $("#selector").empty();
		//                            generateSelectionHTML(ftypes, "ftype");
		//                            $("#selector").dialog('open');
						}
						else
						{
							console.log("not used.");
							createSelector("Select Type", ftypes, ftypeConfirm);
		//                            $("#selector").empty();
		//                            generateSelectionHTML(ftypes, "ftype");
		//                            $("#selector").dialog('open');
						}
					}
				}
				else if (clickRow[cellNum-5] == 'var')
				{
					console.log("HERE");
					if (foundIn(clickRow[cellNum-3], namesRef))
					{
						console.log("Can't change type. Is reffed.\n");
					}
					else
					{
						console.log("not reffed.");
						if (foundIn(clickRow[cellNum-3], namesUsed))
						{
							console.log("used.");
							delN(clickRow[cellNum-3], nvars);
							delN(clickRow[cellNum-3], tvars);
							delN(clickRow[cellNum-3], namesUsed);
							createSelector("Select Type", vtypes, typeConfirm);
		//                            $("#selector").empty();
		//                            generateSelectionHTML(vtypes, "type");
		//                            $("#selector").dialog('open');
						}
						else
						{
							console.log("not used.");
							createSelector("Select Type", vtypes, typeConfirm);
		//                            $("#selector").empty();
		//                            generateSelectionHTML(vtypes, "type");
		//                            $("#selector").dialog('open');
						}
					}
				}
				else if (clickRow[cellNum-11] == 'var')
				{
					console.log("array?");
					if (foundIn(clickRow[cellNum-9], namesRef))
					{
						console.log("Can't change type. Is reffed.\n");
					}
					else
					{
						console.log("not reffed.");
						if (foundIn(clickRow[cellNum-9], namesUsed))
						{
							console.log("used.");
							delN(clickRow[cellNum-9], nvars);
							delN(clickRow[cellNum-9], tvars);
							delN(clickRow[cellNum-9], namesUsed);
							createSelector("Select Type", vtypes, typeConfirm);
		//                            $("#selector").empty();
		//                            generateSelectionHTML(vtypes, "type");
		//                            $("#selector").dialog('open');
						}
						else
						{
							console.log("not used.");
							createSelector("Select Type", vtypes, typeConfirm);
		//                            $("#selector").empty();
		//                            generateSelectionHTML(vtypes, "type");
		//                            $("#selector").dialog('open');
						}
					}
				}
			}
			if (cellVal == 'EXPR')
			{
				switch (exprtype())
				{
					case ('PRINT'):
							console.log('print');
							createSelector("Print Type Selection", wtypes, exprConfirm);
							//dialog openSelector("Print Types", wtypes).done(function(returned) { exprConfirm(returned); returnToNormalColor(); });
							break;
					case ('BOOL'):
							console.log("bool");
							createSelector("Comparison Type Selection", btypes, boolConfirm);
		//                            $("#selector").empty();
		//                            generateSelectionHTML(btypes, "bool");
		//                            $("#selector").dialog('open');
							break;
					case ('TEXT ASSIGNMENT'):
							createSelector("Text Selection", tExpr, exprSelConfirm);
		//                            $("#selector").empty();
		//                            generateSelectionHTML(tExpr, "expr");
		//                            $("#selector").dialog('open');
						break;
					case ('NUMERIC ASSIGNMENT'):
							createSelector("Numeric Selection", nExpr, exprSelConfirm);
		//                            $("#selector").empty();
		//                            generateSelectionHTML(nExpr, "expr");
		//                            $("#selector").dialog('open');
							break;
					case ('PROMPTMSG'):
							createSelector("Prompt", ["text constant", "text variable"], exprSelConfirm);
		//                            $("#selector").empty();
		//                            generateSelectionHTML(["text constant", "text variable"], "expr");
		//                            $("#selector").dialog('open');
						break;
					case ('PROMPTDFLT'):
							createSelector("Prompt", ["text constant", "text variable"], exprSelConfirm);
		//                            $("#selector").empty();
		//                            generateSelectionHTML(["text constant", "text variable"], "expr");
		//                            $("#selector").dialog('open');
						break;
					case ('PARSEDFLT'):
							createNumPad(null, null, "Default", "Enter a default value for this prompt.", true, 10, enterNum);
							//dialog openNumPad(null,null,"Enter default value", "some text", false, 10).done(function(result) {clickedCell.textContent = result; });
							
						break;
					case ('NUMERIC COMPARISON'):
							createSelector("Comparison Type Selection?", nExpr, exprSelConfirm);
		//                            $("#selector").empty();
		//                            generateSelectionHTML(nExpr, "expr")
		//                            $("#selector").dialog('open');
						break;
					case ('RETURN'):
							createSelector("What type?????", wtypes, exprConfirm);
							//dialog openSelector("What type?", wtypes).done(function(returned) { exprConfirm(returned); });
							break;
					default:
						break;
				}
			}
			else if (cellVal == 'ID' && cellNum > 1 && foundIn(clickRow[cellNum-2],compKeys))
			{
				//Choosing the left side of a comparison in a while or if
				createSelector("Choose an identifier.", namesUsed, idConfirm);
			}
			else if (cellVal == 'ID' && cellNum > 1 && clickRow[cellNum-2] == 'function')
			{
				//Assigning an identifier to a function
				createStringPad("Function ID", "Please name the function.", fIDconfirm);
			}
			else if (cellVal == 'FUNCTION') {
				//Calling a function
				createSelector("Function Call", ftypes, fcallType);
			}
			else if (cellVal == 'SIZE')
			{
				//Choosing a size for an Array
				createNumPad(0,null,"Array Size", "Enter a size for the array.", false, 10, enterNum);
			}
			/*Weston edit end*/
			else if (cellVal == 'ID' && clickRow[1] == 'for' && cellNum == 3)
			{
				console.log("for id");
				createSelector("Counter Selection", nvars, forId);
			}
			else if (cellVal == 'ID' && clickRow.indexOf('var') >= 0) {
				createStringPad("Variable ID", "Please name the variable", nameDialogConfirm);
			}
			else if (cellVal == 'ID' && clickRow[cellNum+2] == '=')
			{
                //console.log('ID');
				createSelector("Choose a variable to assign.", namesUsed, idConfirm);
			}
		}
		
		return false;
	});

	editor.setInsertBarMouseEnterListener(function(event){
		event.stopPropagation();
	   /** Implementation for '>' **/
		// Grab the the row number so as to edit the editor
		var insertRowNum = $(this).parent().index();
		
		//a few helpful variables
		var selRow = editor.getSelectedRowIndex();
		var programCount = editor.getRowCount()-1;
		//console.log("insertRowNum " + insertRowNum, "programCount: " + programCount);
		
		// Increase the insertRowNum because we want to enter the new statement
		// in the next line in the code window.
		//insertRowNum++;
			
		if (selRow-1 == insertRowNum) {
				//$(this).css('cursor', 'default');
				return false;
		}
		
		// Display the cursor at the very bottom of the editor
		if (insertRowNum >= programCount) {
				//$(this).css('cursor', 'pointer');
				//$(this).html(">");
				editor.moveInsertionBarCursor(programCount);
				return false;
		}

		// For empty row
		if (editor.rowToArrayHtml(insertRowNum).length == 0) {
				//$(this).css('cursor', 'default');
				return false;
		}
		/*
		try {
				var innerTable = codeTable.rows[insertRowNum].cells[0].children[0];
				var cellTwoText = innerTable.rows[0].cells[2].innerText;
		} catch(e) {
				console.log("Error:", e.message);	
		}*/
		
		//console.log(insertRowNum);
		/*
		console.log("\t1 " + insertRowNum + " " + editor.rowToArrayHtml(insertRowNum).length,editor.rowToArrayHtml(insertRowNum));
		console.log(canInsertAfter(editor.rowToArrayHtml(insertRowNum), insertRowNum));
		console.log("\t2 " + (insertRowNum+1) + " " + editor.rowToArrayHtml(insertRowNum+1).length,editor.rowToArrayHtml(insertRowNum+1));
		console.log(canInsertBefore(editor.rowToArrayHtml(insertRowNum+1), insertRowNum+1));
		console.log("-----------------------------------------------------------------");
		*/
			/*
		// Check if the row is valid or not
		if (!(checkValidRow(editor.rowToArray(insertRowNum), insertRowNum) || checkValidRow(editor.rowToArray(insertRowNum+1), insertRowNum+1))) {		
				//$(this).css('cursor', 'default');
				return false;		
		}*/
		
		//if you can insert after the current row, continue
		if(!canInsertAfter(editor.rowToArrayHtml(insertRowNum)))
			return false;
		
		//if you can insert before the next row, continue
		if(!canInsertBefore(editor.rowToArrayHtml(insertRowNum+1)))
			return false;
		
		//so by here, we should be able to insert after the current row and before the next row
		
		// When hovered, display the cursor
		//$(this).css('cursor', 'pointer');
		//$(this).html(">");
		editor.moveInsertionBarCursor(insertRowNum);
		
		return false;
	});
	
	// checkValidRow() makes sure the program doesn't move somewhere that it shouldn't
	// For example, we don't want the user moving into the variable sections
	function checkValidRow(row, rowNum) {
		if (row.length <= 0) return false;
		if (row[0].indexOf("//") >= 0) return false;								// don't let the user edit a comment
		if (row[0] == '\xA0')  return false;											// don't let the user edit a blank line
		if (row[1] == 'if') return false;
		if (row[1] == 'else') return false;
		if (row[1].indexOf("{") >= 0) return false;
		if (row[1].indexOf("{") >= 0 && rowNum >= programStart) return false;		// don't let the user edit before a '{'
		if (rowNum < variableCount + 3) return false;												// don't let the user edit in the variable space

		// the following if statements ensure that a user doesn't edit before the program start (in the variable or function space..
		// unless its inside a function)
		if ((editor.getSelectedRowIndex() < programStart && rowNum < programStart + 1) || (rowNum < programStart)) {
				if (row[0].indexOf("{") >= 0&& editor.getSelectedRowIndex() > rowNum) return false;
				if (row[0].indexOf("function") >= 0) return false;
		}
		return true;
	}
	
	//true if yes, false if no
	function canInsertBefore(row){
		if (row.length <= 0) return false;
		if (row[0].indexOf("//") >= 0) return false;
		if (row[0] == 'var') return false;
		if (row[0] == 'function') return false;
		if (row[0] == '&nbsp;')  return false;
		
		if(row.length > 1){
			if (row.indexOf("{") >= 0) {console.log("found{"); return false;}
			if (row[1] == 'else') return false;
		}
			
		return true;
	}
	
	function canInsertAfter(row){
		if (row.length <= 0) return false;
		if (row[0] == 'var') return false;
		if (row[0] == 'function') return false;
		if (row[0] == '&nbsp;')  return false;
		
		if(row.length > 1){
			if (row[1] == 'else') return false;
			if (row[1].indexOf("while") >= 0) return false;
			if (row[1].indexOf("for") >= 0) return false;
			if (row[1].indexOf("if") >= 0) return false;
		}
			
		return true;
	}
	
/*
	// check to see if a specific cell contains a keywords; return true if so
	function cellContainsKeyword(table, cellNo) {
		if (table.rows[0].cells[cellNo].innerHTML.indexOf("while") >= 0) return true;
		if (table.rows[0].cells[cellNo].innerHTML.indexOf("if") >= 0) return true;
		if (table.rows[0].cells[cellNo].innerHTML.indexOf("else") >= 0) return true;
		if (table.rows[0].cells[cellNo].innerHTML.indexOf("for") >= 0) return true;
		if (table.rows[0].cells[cellNo].innerHTML.indexOf("return") >= 0) return true;

		return false;
	}

	function containsControlStructure(text) {
		if (text.indexOf("while") >= 0) return true;
		if (text.indexOf("if") >= 0) return true;
		if (text.indexOf("else") >= 0) return true;
		if (text.indexOf("for") >= 0) return true;
	}

	// check to see if a specific cell contains a keywords; return true if so
	function cellContainsKeyword(table, cellNo) {
		if (table.rows[0].cells[cellNo].innerHTML.indexOf("while") >= 0) return true;
		if (table.rows[0].cells[cellNo].innerHTML.indexOf("if") >= 0) return true;
		if (table.rows[0].cells[cellNo].innerHTML.indexOf("else") >= 0) return true;
		if (table.rows[0].cells[cellNo].innerHTML.indexOf("for") >= 0) return true;
		if (table.rows[0].cells[cellNo].innerHTML.indexOf("return") >= 0) return true;

		return false;
	}*/

	// addVariable() is responsible for adding a variable/array declaration
	function addVariable(element) {
		var row;
		var cell;
		var innerTable;

		// if there are no variables initialized yet add some stuff
		if (variableCount == 0) {
			editor.addRow(variableCount + 2,
				[{text:"//&nbsp;", type:"comment"},
				{text:"Variables", type:"comment"}]);
				
			editor.addRow(variableCount + 3,
				[{text:"&nbsp;"}]);

			programStart += 2;	// increase the program start line
			//selRow++;		// increase the selected row
			programCount += 2;
		}
		
		// if the element is a variable
		if (element == "variable") {
			//adds "var ID; /*TYPE*/"
			editor.addRow(variableCount + 3,
				[{text:"var", type:"keyword"},
				{text:"&nbsp;"},
				{text:"ID"},
				{text:";&nbsp;"},
				{text:"&nbsp;/*", type:"keyword"},
				{text:"TYPE", type:"keyword"},
				{text:"*/", type:"keyword"}]);
		}
		// if its an array
		else if (element == "array") {
			//add "var ID = new Array(size); /*TYPE*/"
			editor.addRow(variableCount + 3,
				[{text:"var", type:"keyword"},
				{text:"&nbsp;"},
				{text:"ID"},
				{text:"&nbsp;=&nbsp;"},
				{text:"new&nbsp;", type:"keyword"},
				{text:"Array"},
				{text:"(", type:"openParen"},
				{text:"SIZE"},
				{text:")", type:"closeParen"},
				{text:";"},
				{text:"&nbsp;/*", type:"keyword"},
				{text:"TYPE", type:"keyword"},
				{text:"*/", type:"keyword"}]);
		}

		//selRow++;			// increase the selected row
		variableCount++;	// increase the variable count
		programStart++;		// increase the program start line
		programCount++;
		//toggleEvents();		// toggle events to refresh the newly created row
		//refreshLineCount();	// refresh the line count
	}

	// addOneLineElement() is responsible for adding elements that only require one line (excluding variable and array declarations)
	function addOneLineElement(element) {
		//if this is the very first move to add to the main program, add the main program comment
		//if (!firstMove) {
		//	addMainProgramComment();
			firstMove = true;
		//}

		var indentStr = findIndentation(editor.getSelectedRowIndex());	// get the correct indentation
		//var indentStr = "";

		// depending on which element it is, format the row correspondingly
		if (element == "assignment"){
			//adds "ID = EXPR;
			editor.addRow(editor.getSelectedRowIndex(),
				[{text:indentStr},
				{text:"ID"},
				{text:"&nbsp;"},
				{text:"="},
				{text:"&nbsp"},
				{text:"EXPR"},
				{text:";"}]);
		}
		else if (element == "write") {
			//adds "document.write(EXPR);"
			editor.addRow(editor.getSelectedRowIndex(),
				[{text:indentStr},
				{text:"document.write", type:"keyword"},
				{text:"(", type:"openParen"},
				{text:"EXPR"},
				{text:")", type:"closeParen"},
				{text:";"}]);
		}
		else if (element == "writeln") {
			//adds "document.writeln(EXPR);"
			editor.addRow(editor.getSelectedRowIndex(),
				[{text:indentStr},
				{text:"document.writeln", type:"keyword"},
				{text:"(", type:"openParen"},
				{text:"EXPR"},
				{text:")", type:"closeParen"},
				{text:";"}]);
		}
		else if (element == "stringPrompt") {
			//adds "ID = prompt(EXPR, EXPR);"
			editor.addRow(editor.getSelectedRowIndex(),
				[{text:indentStr},
				{text:"ID"},
				{text:"&nbsp;"},
				{text:"="},
				{text:"&nbsp;"},
				{text:"prompt", type:"keyword"},
				{text:"(", type:"openParen"},
				{text:"EXPR"},
				{text:",&nbsp;"},
				{text:"EXPR"},
				{text:")", type:"closeParen"},
				{text:";"}]);
		}
		else if (element == "numericPrompt") {
			//adds "ID = parseFloat(prompt(EXPR, EXPR));
			editor.addRow(editor.getSelectedRowIndex(),
				[{text:indentStr},
				{text:"ID"},
				{text:"&nbsp;"},
				{text:"="},
				{text:"&nbsp;"},
				{text:"parseFloat", type:"keyword"},
				{text:"(", type:"openParen"},
				{text:"prompt", type:"keyword"},
				{text:"(", type:"openParen"},
				{text:"EXPR"},
				{text:","},
				{text:"EXPR"},
				{text:")", type:"closeParen"},
				{text:")", type:"closeParen"},
				{text:";"}]);
		}
		else if (element == "functionCall") {
			//adds "ID = FUNCTION();"
			editor.addRow(editor.getSelectedRowIndex(),
				[{text:indentStr},
				{text:"FUNCTION"},
				{text:"(", type:"openParen"},
				{text:")", type:"closeParen"},
				{text:";"}]);
		}
		else if (element == "return") {
			//adds "return EXPR;"
			editor.addRow(editor.getSelectedRowIndex(),
				[{text:indentStr},
				{text:"return", type:"keyword"},
				{text:"&nbsp;"},
				{text:"EXPR"},
				{text:";"}]);
		}

		//selectRow(selRow+1);				// increase the selected row by one

		// if the selected row is less than the program start line (editing a function), increase program start
		if (editor.getSelectedRowIndex() < programStart) programStart++;
		programCount++;
		//toggleEvents();									// toggle events to refresh them
		//refreshLineCount();								// and also refresh line count
	}

	// addIfThen() is responsible for adding an If/Then control structure
	function addIfThen() {
		// if this is the first move the user has made toward the main program, put the main program comment
		//if (!firstMove) {
		//	addMainProgramComment();
			firstMove = true;
		//}
		var indentStr = findIndentation(editor.getSelectedRowIndex());	// get the correct indentation
		//var indentStr = "";
		
		//adds "if(EXPR)"
		editor.addRow(editor.getSelectedRowIndex(),
			[{text:indentStr},
			{text:"if", type:"keyword"},
			{text:"(", type:"openParen"},
			{text:"EXPR"},
			{text:")", type:"closeParen"},
			]);
		
		//adds "{"
		editor.addRow(editor.getSelectedRowIndex(),
			[{text:indentStr},
			{text:"{", type:"openBrack"}]);
			
		//adds "}"
		editor.addRow(editor.getSelectedRowIndex(),
			[{text:indentStr},
			{text:"}", type:"closeBrack"}]);
		
		//selectRow(selRow + 3);								// increase the selected row by 3 (added three items)

		if (editor.getSelectedRowIndex() <= programStart) programStart += 3;		// if the selected row is less than the program start (editing a function), increase program start by 3
		programCount+=3;
		//toggleEvents();										// toggle events
		//refreshLineCount();									// refresh the line count
	}

	// addIfElse() is very similar to addIfThen() except we add the 'else'
	function addIfElse() {
		//if (!firstMove) {
		//	addMainProgramComment();
			firstMove = true;
		//}
		var indentStr = findIndentation(editor.getSelectedRowIndex());
		//var indentStr = "";
		
		//adds "if(EXPR)"
		editor.addRow(editor.getSelectedRowIndex(),
			[{text:indentStr},
			{text:"if", type:"keyword"},
			{text:"(", type:"openParen"},
			{text:"EXPR"},
			{text:")", type:"closeParen"},
			]);
			
		//adds "{"
		editor.addRow(editor.getSelectedRowIndex(),
			[{text:indentStr},
			{text:"{", type:"openBrack"}]);
			
		//adds "}"
		editor.addRow(editor.getSelectedRowIndex(),
			[{text:indentStr},
			{text:"}", type:"closeBrack"}]);
			
		//adds "else"
		editor.addRow(editor.getSelectedRowIndex(),
			[{text:indentStr},
			{text:"else", type:"keyword"}]);
			
		//adds "{"
		editor.addRow(editor.getSelectedRowIndex(),
			[{text:indentStr},
			{text:"{", type:"openBrack"}]);
			
		//adds "}"
		editor.addRow(editor.getSelectedRowIndex(),
			[{text:indentStr},
			{text:"}", type:"closeBrack"}]);
			
		//selectRow(selRow + 6);

		if (editor.getSelectedRowIndex() <= programStart) programStart += 6;
		programCount += 6;
		//toggleEvents();
		//refreshLineCount();
	}

	// addWhile() is very similar to adding any other structure
	function addWhile() {
		//if (!firstMove) {
		//	addMainProgramComment();
			firstMove = true;
		//}
		var indentStr = findIndentation(editor.getSelectedRowIndex());
		//var indentStr = "";
		
		//adds "while(EXPR)"
		editor.addRow(editor.getSelectedRowIndex(),
			[{text:indentStr},
			{text:"while", type:"keyword"},
			{text:"(", type:"openParen"},
			{text:"EXPR"},
			{text:")", type:"closeParen"},
			]);
			
		//adds "{"
		editor.addRow(editor.getSelectedRowIndex(),
			[{text:indentStr},
			{text:"{", type:"openBrack"}]);
			
		//adds "}"
		editor.addRow(editor.getSelectedRowIndex(),
			[{text:indentStr},
			{text:"}", type:"closeBrack"}]);
			
		//selectRow(selRow + 3);

		if (editor.getSelectedRowIndex() <= programStart) programStart += 3;
		programCount += 3;
		//toggleEvents();
		//refreshLineCount();
	}

	// addFor() adds a for loop to the current selected line just like addWhile()
	function addFor() {
		//if (!firstMove) {
		//	addMainProgramComment();
			firstMove = true;
		//}
		var indentStr = findIndentation(editor.getSelectedRowIndex());
		//var indentStr = "";
		
		//adds "for(ID = EXPR; ID < EXPR; ID++)"
		editor.addRow(editor.getSelectedRowIndex(),
			[{text:indentStr},
			{text:"for", type:"keyword"},
			{text:"(", type:"openParen"},
			{text:"ID"},
			{text:"&nbsp;"},
			{text:"="},
			{text:"&nbsp;"},
			{text:"EXPR"},
			{text:";&nbsp;"},
			{text:"ID"},
			{text:"&nbsp;"},
			{text:"&lt;&nbsp;"},
			{text:"EXPR"},
			{text:";&nbsp;"},
			{text:"ID"},
			{text:"++"},
			{text:")", type:"closeParen"}]);
			
		//adds "{"
		editor.addRow(editor.getSelectedRowIndex(),
			[{text:indentStr},
			{text:"{", type:"openBrack"}]);
			
		//adds "}"
		editor.addRow(editor.getSelectedRowIndex(),
			[{text:indentStr},
			{text:"}", type:"closeBrack"}]);
			
		
		//selectRow(selRow + 3);

		if (editor.getSelectedRowIndex() <= programStart) programStart += 3;
		programCount += 3;
		//toggleEvents();
		//refreshLineCount();
	}

	// addFunction() adds a new function declaration before the program start and after the variables declarations
	function addFunction() {
		var beginRow;
        
		// if the user hasn't edited the main program OR selected row is less than program start, we begin at the program start line
		//if (firstMove) {
		if (editor.getSelectedRowIndex() < programStart) {
			beginRow = programStart;
		} else {
			beginRow = programStart-1;
		}
        
		//if (!firstMove || selRow < programStart) beginRow = programStart;
		//else beginRow = programStart - 1;	// otherwise, we begin at programStart - 1
        
		// if we haven't added a function yet, we must insert the '// Functions' comment
		if (funcCount == 0) {
            /*row = codeTable.insertRow(beginRow);							// add the row at the 'beginRow' index
            cell = row.insertCell(0);
            cell.innerHTML = innerTableTemplate;
            innerTable = codeTable.rows[beginRow].cells[0].children[0];
            */
            //if (selRow >= beginRow) selRow++;								// increase selected row if it is greater or equal to beginRow
            
            //addRow(innerTable, [ "//&nbsp;", "Functions" ], 2);
            //addRowStyle(innerTable, [ green, green, ], 2);
			
			editor.addRow(beginRow,
				[{text:"//&nbsp;", type:"comment"},
				{text:"Functions", type:"comment"}]);
			
            beginRow++;
            
            programStart++;	// increase program start line
            programCount++;
		}
        
		// add a blank line at begin row (this creates a blank line after the function declaration)
		/*row = codeTable.insertRow(beginRow);
		cell = row.insertCell(0);
		cell.innerHTML = innerTableTemplate;
		innerTable = codeTable.rows[beginRow].cells[0].children[0];
		addRow(innerTable, [ "&nbsp;" ], 2);*/
		
		editor.addRow(beginRow, [{text:"&nbsp;"}]);
		
		programStart++;
		programCount++;
		//if (selRow >= beginRow) selRow++;
        /*
		for (var i = 0; i < 3; i++) {											// iterate three times
			row = codeTable.insertRow(beginRow + i);							// create a row at beginRow
			cell = row.insertCell(0);											// insert a new cell in the row
			cell.innerHTML = innerTableTemplate;								// put our inner table template here
			innerTable = codeTable.rows[beginRow + i].cells[0].children[0];		// grab the innerTable object we just created
            
			// add the row on the first iteration, a '{' on second iteration, and a '}' on third iteration
			if (i == 0) {
				addRow(innerTable, [ "function", "&nbsp;", "ID", "(", ")", "&nbsp;", "/", "VOID", "/" ], 2);
				addRowStyle(innerTable, [ blue, black, black, black, black, black, blue, blue, blue ], 2);
			}
			else if (i == 1) addRow(innerTable, [ "{" ], 2);
			else if (i == 2) addRow(innerTable, [ "}" ], 2);
            
			if (selRow >= beginRow + i) selRow++;	// if the selected row is greater than or equal to the current row, increase selected row
		}*/
		
		//adds "function ID() /*VOID*/"
		editor.addRow(beginRow++,
			[{text:"function", type:"keyword"},
			{text:"&nbsp;"},
			{text:"ID"}, 
			{text:"(", type:"openParen"},
			{text:")", type:"closeParen"},
			{text:"&nbsp;"},
			{text:"/*", type:"keyword"},
			{text:"VOID", type:"keyword"},
			{text:"*/", type:"keyword"}]);
			
		//adds "{"
		editor.addRow(beginRow++,
			[{text:"{", type:"openBrack"}]);
			
		//adds "}"
		editor.addRow(beginRow++,
			[{text:"}", type:"closeBrack"}]);
		
		//selectRow(selRow);							// make sure the 'selRow' row is selected
        
		programStart += 3;							// increase the program start by 3
		programCount += 3;
		funcCount++;								// increase the function count
		functionList.push("FUNCTION");				// push FUNCTION to the function list
		//toggleEvents();								// refresh events
		//refreshLineCount();							// refresh the line count
	}
/*
	// addRow() takes an innerTable, a string of cell values, and a start index and populates the innerTable with these values
	function addRow(table, values, startInd) {
		var cell;
		for (var i = 0; i < values.length; i++) {			// for all cells in the table
			cell = table.rows[0].insertCell(startInd++);	// insert a cell at startInd
			cell.innerHTML = values[i];						// make the innerHTML of the cell cells[i]
		}
        addNewInsertRow();
	}

	// addRowStyle() takes an innerTable, a string of colors, and a start index and styles the innerTable cells with these colors
	function addRowStyle(table, colors, startInd) {
		var cell;
		for (var i = 0; i < colors.length; i++) {			// for all cells in the table
			cell = table.rows[0].cells[startInd++];			// get the cell at the current index
			cell.style.color = colors[i];					// change its style to cells[i]
		}
	}
*/
	// deleteFunction() checks to see what the element is that is requested to be deleted, and deletes that element
	function deleteFunction(rowNum, colNum) {
		var innerTable = codeTable.rows[rowNum].cells[0].children[0];			// grab the inner table that needs to be deleted

		if (isOneLineElement(innerTable.rows[0])) deleteOneLineElement(rowNum);	// if its a one line element, delete it
	}

	// deleteOneLineElement() is responsible for appropriately deleting an element that takes up one line
	function deleteOneLineElement(rowNum) {
		console.log("\tdelete:", rowNum, editor.rowToArrayHtml(rowNum));
		if (programStart > rowNum) programStart--;

		// Delete row from the editor
		editor.deleteRow(rowNum);
		programCount--;
	}

	// isOneLineElement() checks to see if the row passed is a one line element such as an assignment
	function isOneLineElement(row) {
		var rowLength = row.cells.length;

		if (rowLength == 6) {
			for (var i = 0; i < rowLength; i++) {
				if (row.cells[i].textContent.indexOf("=") >= 0) { return true; }		// check for assignment
				if (row.cells[i].textContent.indexOf("write") >= 9) { return true; }	// check for a write/writeln
			}
		}
		else if (rowLength == 10) {
			for (var i = 0; i < rowLength; i++) {
				if (row.cells[i].textContent.indexOf("prompt") >= 0) { return true; }	// check for a prompt
			}
		}
		else if (rowLength == 12) {
			for (var i = 0; i < rowLength; i++) {
				if (row.cells[i].textContent.indexOf("prompt") >= 0) { return true; }	// check for a prompt again (numeric prompt)
			}
		}
		else {
			if (row.cells[2].textContent.indexOf("return") >= 0) return true;			// check for a return
			if (row.cells[2].textContent.indexOf("FUNCTION") >= 0) return true;		// check for a function that hasn't been renamed
			if (functionExists(row.cells[2].textContent)) return true;				// check to see if the function exists that has been named
		}
	}

	// functionExists() returns true or false depending if a function is found in the function list
	function functionExists(cellText) {
		for (var i = 0; i < functionList.length; i++) {
			if (cellText.contains(functionList[i])) return true;
		}

		return false;
	}
/*
	// selectRow() selects a row with the specified rowNum
	function selectRow(rowNum) {
		if (selRow != -1) {														// if there is a selected row
			var innerTable = codeTable.rows[selRow].cells[0].children[0];		// grab the innerTable for the currently selected row
			innerTable.rows[0].cells[0].innerHTML = blank;						// make its arrow go away (it is no longer selected)
		}

		selRow = rowNum;														// make the new selected row to be rowNum
		var innerTable = codeTable.rows[selRow].cells[0].children[0];			// grab its inner table
		innerTable.rows[0].cells[0].innerHTML = arrow;							// make it have an arrow (it is now selected)
	}*/

	// findIndentation() returns a string with the appropriate spacing depending on the row number passed to it
	// Starting from the top of the code, it finds how many mismatching brackets '{' '}' there are when the row
	// is reached. The number of opened brackets without a matching close parenthesis is how many tabs this row
	// will need
	function findIndentation(row) {
		var bracket = 0;	// number of brackets opened
		for (var i = 0; i < editor.getRowCount(); i++) {								// iterate throughout the code table
			if (i == row) break;														// when the iteration equals the row, stop
			var rowArr = editor.rowToArrayHtml(i);
			
			if (rowArr.indexOf('{') >= 0) {			// if an open bracket, add one to bracket
				bracket++;
			}
			else if (rowArr.indexOf('}') >= 0) {		// if a close bracket, subtract one from bracket
				bracket--;
			}
		}

		// the bracket variable is how many indents we need
		var indents = "";
		for (var i = 0; i < bracket; i++) indents += indent;
		
		return indents;
	}

/*
	// addMainProgramComment() simply adds the main program comment '// Main Program'
	function addMainProgramComment() {
		var row = codeTable.insertRow(programStart);
		var cell = row.insertCell(0);
		cell.innerHTML = innerTableTemplate;
		innerTable = codeTable.rows[programStart].cells[0].children[0];
		addRow(innerTable, [ "//&nbsp;", "Main Program" ], 2);
		addRowStyle(innerTable, [ green, green ], 2);
		if (selRow >= programStart) selRow++;
		programStart++;
		firstMove = false;
	}
*/
	// refreshLineCount() refreshes the line count in the first cell of every inner table
	function refreshLineCount() {
		var innerTable;
		for (var i = 0; i < codeTable.rows.length; i++) {
			innerTable = codeTable.rows[i].cells[0].children[0];
			if (i < 9) innerTable.rows[0].cells[0].innerHTML = i + 1 + "&nbsp;";
			else innerTable.rows[0].cells[0].textContent = i+1;
		}
	}

	// selectDialogConfirm() has to do with the selecting of options from the jQuery UI (not implemented)
	function selectDialogConfirm(result) {
		console.log(result);
	}

	// Find specific string in a row
	// Iterate through every column to find the matching string
	function rowContainsString(row, startingRow, str) {
			// For the end of the program
			if (startingRow-1 == programCount) {
				return false;
			}
			var cellVal;
			// Length of the current row
			var length = row.rows[startingRow].cells.length;

			// Iterate through each column
			for (var i = 0; i < length; i++) {
					cellVal = row.rows[startingRow].cells[i].textContent;
					// If the column contains the string return true
					if (cellVal.match(str)) {
							return true;
					}
			}
			return false;
	}

	// Check if the variable has already been used in the code editor
	function referenceCheck(keyWord, lineNum) {
		// The length of the rows in the code editor
		//var length = codeTable.rows.length;
		var length = editor.getRowCount();

		// We are starting at line 3 because we do not need to check the first three line
		for (var i = 3; i < length; i++) {
			// Grab the inner table from the current row
			//var innerTable = codeTable.rows[i].cells[0].children[0];
			// Get the length of the current row to check for matching string
			//var colLength = innerTable.rows[0].cells.length;
			
			var row = editor.rowToArrayHtml(i);
			var colLength = row.length;

			// Skip the row from where the keyWord was obtained
			if (i == lineNum) {
				continue;
			}

			// Check all the cells in the current row for matching string
			// starting at column 3 because we do not want to check the line number, arrow, and a blank column.
			for (var j = 0; j < colLength; j++) {
				// Get the text value from each cell
				//cellVal = innerTable.rows[0].cells[j].textContent;
				// If found then return true
				if (row[j] === keyWord) {
					return true;
				}
				// Do not check the row that contains a comment
				else if (row[j] === "//") {
					continue;
				}
			}
		}
		return false;
	}

	//Weston's functions below here
    /*Weston edit start*/

    /*Weston edit end*/
    
	function typeConfirm(result) {  // For confirming variable and array types
        if (clickRow[clickedCellNum-5] == 'var')
        {
            if (result == 'Text') {     // If they selected test before clicking okay
                clickedCell.text('TEXT');
                if (clickRow[clickedCellNum-3] != 'ID')
                {
                    tvars.push(clickRow[clickedCellNum-3]);
                }
            }
            else if (result == 'Numeric') {
                clickedCell.text('NUMERIC');
                if (clickRow[clickedCellNum-3] != 'ID')
                {
                    //console.log(innerTablet.rows[0].cells[4].textContent);
                    nvars.push(clickRow[clickedCellNum-3]);
                }
            }
            if (!foundIn(clickRow[clickedCellNum-3], namesUsed) && clickRow[clickedCellNum-3] != 'ID') namesUsed.push(clickRow[clickedCellNum-3]);
        }
        else if (clickRow[clickedCellNum-11] == 'var') //for arrays
        {
            if (result == 'Text') {     // If they selected test before clicking okay
                clickedCell.text('TEXT');
                if (clickRow[clickedCellNum-9] != 'ID')
                {
                    tvars.push(clickRow[clickedCellNum-9]);
                }
            }
            else if (result == 'Numeric') {
                clickedCell.text('NUMERIC');
                if (clickRow[clickedCellNum-9] != 'ID')
                {
                    //console.log(innerTablet.rows[0].cells[4].textContent);
                    nvars.push(clickRow[clickedCellNum-9]);
                }
            }
            if (!foundIn(clickRow[clickedCellNum-9], namesUsed) && clickRow[clickedCellNum-9] != 'ID') namesUsed.push(clickRow[clickedCellNum-9]);
        }
        console.log("nvars: " + nvars +"\ntvars: " + tvars + "\nnamesUsed: " + namesUsed);
//        $("#selector").dialog('close');
	}
    
    function ftypeConfirm(result) {  // For confirming types for functions
        if (result == 'Text') {     // If they selected test before clicking okay
            clickedCell.text('TEXT');
            if (clickRow[clickedCellNum-5] != 'ID')
            {
                tFuns.push(clickRow[clickedCellNum-5]);
            }
        }
        else if (result == 'Numeric') {
            clickedCell.text('NUMERIC');
            if (clickRow[clickedCellNum-5] != 'ID')
            {
                    //console.log(innerTablet.rows[0].cells[4].textContent);
                nFuns.push(clickRow[clickedCellNum-5]);
            }
        }
        else if (result == 'Void') {
            clickedCell.text('VOID');
            if (clickRow[clickedCellNum-5] != 'ID')
            {
                //console.log(innerTablet.rows[0].cells[4].textContent);
                vFuns.push(clickRow[clickedCellNum-5]);
            }
        }
        if (!foundIn(clickRow[clickedCellNum-5], namesUsed) && clickRow[clickedCellNum-5] != 'ID') namesUsed.push(clickRow[clickedCellNum-5]);
        console.log("nfuns: " + nFuns +"\ntfuns: " + tFuns + "\nvfuns: " + vFuns + "\nnamesUsed: " + namesUsed);
//        $("#selector").dialog('close');
	}
    
    function exprtype(){ //For determining the type of an EXPR in the code
        for (counter = 0; counter < clickRow.length; counter++)
        {
			//if there's some kind of assignment, and there's no point in
			// searching here after 3 because there shouldn't be any more
			// assignments
            if (clickRow[counter] == '=' && counter < 4)
            {
                if (clickRow[counter+2] == 'prompt')
                {
                    console.log(clickedCellNum + " " + counter);
                    if ((counter+4) == clickedCellNum){
                        return 'PROMPTMSG';
                    }
                    else if ((counter+6) == clickedCellNum){
                        return 'PROMPTDFLT';
                    }
                    else return 0;
                }
                else if (clickRow[counter+2] == 'parseFloat')
                {
                    if ((counter+6) == clickedCellNum){
                        return 'PROMPTMSG';
                    }
                    else if ((counter+8) == clickedCellNum){
                        return 'PARSEDFLT';
                    }
                    else return 0;
                }
                else
                {
                    if (foundIn(clickRow[counter-2],nvars)) return 'NUMERIC ASSIGNMENT';
                    else if (foundIn(clickRow[counter-2],tvars)) return 'TEXT ASSIGNMENT';
                    else return 0;
                }
            }
			//if it's a while loop or an if statement
            else if (foundIn(clickRow[counter], compKeys))
            {
                if (clickRow[counter+1] == '(' && clickRow[counter+3] == ')')
                {
                    return('BOOL');
                }
                else
                {
                    console.log('not bool');
                    if (foundIn(clickRow[counter+2],nvars))
                    {
                        return ('NUMERIC COMPARISON');
                    }
                    else return 0;
                }
            }
            else if (clickRow[counter] == "document.write" || clickRow[counter] == "document.writeln")
            {
                return ('PRINT');
            }
            else if (clickRow[counter] == "return")
            {
                return ('RETURN');
            }
            console.log(clickRow[counter]);
        }
		
		//returnToNormalColor();
        return 0;
    }

	function nameDialogConfirm(result) {
		// empty string is not valid inpute
		if (result == "")
		{
			$("#selector").dialog('close');
			return;
		}

		//if the name is in use already, abort
		if (foundIn(result,namesUsed) == 1) {
			console.log("Already exists (nameDialogconfirm)");
			$("#selector").dialog('close');
			return; //this will need to spawn a dialog box before returning
		}

		//if the name is a reserved word, abort
		if (foundIn(result,resWords) == 1)
		{
			console.log(result + " is a reserved word.");
			$("#selector").dialog('close');
			return;
		}

		//need to add functionality for changing names (removing from namesUsed)
		clickedCell.text(result);
        console.log("The result is " + result);
		namesUsed.push(result);

		var lastCellindex = clickRow.length-1;
        //clickRow[lastCellindex-1]
		if (clickRow[lastCellindex-1] == 'NUMERIC') nvars.push(result);
		else if (clickRow[lastCellindex-1] == 'TEXT') tvars.push(result);
		//$("#nameDialog").dialog('close');
        console.log("nvars: " + nvars +"\ntvars: " + tvars + "\nnamesUsed: " + namesUsed);
//		$("#selector").dialog('close');
		
		//returnToNormalColor();
	}

	function idConfirm(result) {
        if (foundIn(result, namesUsed))
        {
            console.log("id value: " + result);
			clickedCell.text(result);
            console.log("\n" + result);
            namesRef.push(result);
            console.log(namesRef);
        }
//		$("#selector").dialog('close');
		
		//returnToNormalColor();
	}

//	function selectorCancel() {
//		$("#selector").dialog('close');
//
//	}

    function tConstantconfirm(result){
//        $("#selector").dialog('close');
		clickedCell.text('"' + result + '"');
		
		//returnToNormalColor();
    }
    
    function exprSelConfirm(result){
        $("#selector").dialog('close');
        switch (result)
        {
            case "numeric constant":
                createNumPad(null,null,"Number Pad", "Enter a value.", true, 10, enterNum);
                //dialog openNumPad(null, null, "Enter a value", "not sure what this string is", false, 10).done( function(result) {console.log(result);                                                                                                        clickedCell.textContent = result;                                                                                                        });
                break;
            case "EXPR":
                createSelector("Choose an Expression Format.", nExprtypes, mathExpr);
                //dialog openSelector("Expression choices", nExprtypes).done(function(returned) { mathExpr(returned); returnToNormalColor(); });
                break;
            case "text constant":
                createStringPad("Text Entry Box", "Enter a text constant", textEntry);
                
//                $("#selector").empty();
//                dial.innerHTML = "<textarea id='dial" + sandboxNum + "Text' size=\"4\" style=\"width: 100%;margin-bottom:10px\"></textarea> <div> <button id='dial" + sandboxNum + "OKButton' type=\"button\" style=\"width:4em;height:2em\">Okay</button> <button id='dial" + sandboxNum + "CancelButton' type=\"button\" style = \"width:4em;height:2em\">Cancel</button> </div>";
//                
//                dialOKButton = document.getElementById("dial" + sandboxNum + "OKButton");
//                dialOKButton.onclick = function() {
//                    console.log("Here.");
//                    var textArea = document.getElementById("dial" + sandboxNum + "Text");
//                    console.log(textArea.value);
//                    tConstantconfirm(textArea.value);
//                };
//                
//                dialCancelButton = document.getElementById("dial" + sandboxNum + "CancelButton");
//                dialCancelButton.onclick = function() {	selectorCancel(); };
//                
//                $("#selector").dialog('open');

                break;
            case "text variable":
                createSelector("Text Var Selection", tvars, idConfirm);
//                $("#selector").empty;
//                generateSelectionHTML(tvars, 'id');
//                $("#selector").dialog('open');
                break;
            case "numeric function call":
                createSelector("Function Call Selection", nFuns, funConfirm);
                break;
            case "text function call":
                createSelector("Function Call Selection", tFuns, funConfirm);
//                $("#selector").empty;
//                generateSelectionHTML(tFuns, 'fun');
//                $("#selector").dialog('open');
                break;
            case "EXPR + EXPR":
                var cell;
                var values = ["&nbsp;", "+", "&nbsp;", "EXPR"];
                clickedCell.text("EXPR");
                /*for (var i = 0; i < values.length; i++) {			// for all cells in the table
                    cell = innerTablet.rows[0].insertCell(++clickedCellNum);	// insert a cell at startInd
                    cell.innerHTML = values[i];						// make the innerHTML of the cell cells[i]
                }*/
				console.log(clickedCell.index() + " " + clickedCell.text());
				
				editor.addCell(clickedCell,
					[{text:"&nbsp;"},
					{text:"+"},
					{text:"&nbsp;"},
					{text:"EXPR"}]
				);
				console.log(clickedCell.index() + " " + clickedCell.text());
				
				//get the clickRow again, since stuff has changed
				clickRow = editor.rowToArrayHtml(clickedCell.parent().parent().parent().parent().parent().index()); //will this work?
                break;
				
			case "numeric variable":
                createSelector("Numeric Var Selection", nvars, idConfirm);
//				$("#selector").empty();
//				generateSelectionHTML(nvars, 'id');
//				$("#selector").dialog('open');
				break;

            default:
                break;
        }
		
		//returnToNormalColor();
    }
    
    function mathExpr(result){
        console.log(result);
        switch (result)
        {
            case ("EXPR + EXPR"):
                values = ["EXPR", "&nbsp;", "+", "&nbsp;", "EXPR"];
                break;
            case ("EXPR - EXPR"):
                values = ["EXPR", "&nbsp;", "-", "&nbsp;", "EXPR"];
                break;
            case ("EXPR * EXPR"):
                values = ["EXPR", "&nbsp;", "*", "&nbsp;", "EXPR"];
                break;
            case ("EXPR / EXPR"):
                values = ["EXPR", "&nbsp;", "/", "&nbsp;", "EXPR"];
                break;
            case ("EXPR % EXPR"):
                values = ["EXPR", "&nbsp;", "%", "&nbsp;", "EXPR"];
                break;
            case ("(EXPR)"):
                values = ["(", "EXPR", ")"];
                break;
            default:
                break;
        }
        clickedCell.text(values[0]);
		var cell = clickedCell;
        for (i = 1; i < values.length; i++)
        {
            //cell = innerTablet.rows[0].insertCell(++clickedCellNum);
            //cell.innerHTML = values[i];
			
			editor.addCell(clickedCell, [{text:values[i]}]);
			
			cell = cell.nextSibling;
        }
        
		//get the clickRow again, since stuff has changed
		clickRow = editor.rowToArrayHtml(clickedCell.parent().parent().parent().parent().parent().index()); //will this work?
		
        //returnToNormalColor();                 
    }
    
    function boolConfirm(result){
//        $("#selector").dialog('close');
        var values = ["&nbsp;", "", "&nbsp;", "EXPR"];
        switch (result)
        {
            case ("EXPR == EXPR"):
                values[1] = "==";
                break;
            case ("EXPR != EXPR"):
                values[1] = "!=";
                break;
            case ("EXPR > EXPR"):
                values[1] = ">";
                break;
            case ("EXPR >= EXPR"):
                values[1] = ">=";
                break;
            case ("EXPR < EXPR"):
                values[1] = "<";
                break;
            case ("EXPR <= EXPR"):
                values[1] = "<=";
                break;
            default:
                break;
        }
        clickedCell.text("ID");
        /*for (var i = 0; i < values.length; i++) {			// for all cells in the table
            cell = innerTablet.rows[0].insertCell(++clickedCellNum);	// insert a cell at startInd
            cell.innerHTML = values[i];						// make the innerHTML of the cell cells[i]
        }*/
		
		var cell = clickedCell;
        for (var i = 0; i < values.length; i++)
        {
			editor.addCell(clickedCell, [{text:values[i]}]);
			
			cell = cell.nextSibling;
        }
        
		//get the clickRow again, since stuff has changed
		clickRow = editor.rowToArrayHtml(clickedCell.parent().parent().parent().parent().parent().index()); //will this work?
		
		//returnToNormalColor();
    }

	// Weston's functions
    /*Weston edit start*/
    function funCallfinal(result){
        clickedCell.text(result);
        namesRef.push(result);
        $("#selector").dialog('close');
    }
    /*Weston edit end*/
    
    function funConfirm(result){
        if (foundIn(result, namesUsed))
        {
            console.log("id value: " + result);
            clickedCell.text(result + "()");
            console.log("\n" + result);
            namesRef.push(result);
            console.log(namesRef);
        }
		$("#selector").dialog('close');
    }
    
	function generateSelectionHTML(list, kind){
        console.log(list);
		var wstring;
        console.log(list);
		wstring = "<select id='selDrop" + sandboxNum + "' size=\"4\" style=\"width: 100%;marginbottom:10px\">\n";
		for (i = 0; i < list.length; i++)
		{
			wstring += "<option value=\"" + list[i] + "\">" + list[i] + "</option>\n";
		}
		wstring += "</select> \n<div>\n <button id='dial" + sandboxNum + "OKButton' type=\"button\" style=\"width:4em;height:2em\">Okay</button>\n <button id='dial" + sandboxNum + "CancelButton' type=\"button\" style=\"width:4em;height:2em\">Cancel</button>\n </div>";
		
		dial.innerHTML = wstring;
		
		switch (kind)
		{
                /*Weston edit start*/
            case "fcall":
                dialOKButton = document.getElementById("dial" + sandboxNum + "OKButton");
				dialOKButton.onclick = function() {
					var selectDrop = document.getElementById("selDrop" + sandboxNum);
					funCallfinal(selectDrop.value);
				};
                break;
                /*Weston edit end*/
            case "fun":
                dialOKButton = document.getElementById("dial" + sandboxNum + "OKButton");
				dialOKButton.onclick = function() {
					var selectDrop = document.getElementById("selDrop" + sandboxNum);
					funConfirm(selectDrop.value);
				};
                break;
            case "ftype":
                dialOKButton = document.getElementById("dial" + sandboxNum + "OKButton");
                dialOKButton.onclick = function() {
                    var selectDrop = document.getElementById("selDrop" + sandboxNum);
                    ftypeConfirm(selectDrop.value);
                };
                break;
            case "expr":
                dialOKButton = document.getElementById("dial" + sandboxNum + "OKButton");
                dialOKButton.onclick = function() {
                    var selectDrop = document.getElementById("selDrop" + sandboxNum);
                    exprSelConfirm(selectDrop.value);
                };
                break;
			case "id":
				dialOKButton = document.getElementById("dial" + sandboxNum + "OKButton");
				dialOKButton.onclick = function() {
					var selectDrop = document.getElementById("selDrop" + sandboxNum);
					idConfirm(selectDrop.value);
				};
				break;
			case "type":
				dialOKButton = document.getElementById("dial" + sandboxNum + "OKButton");
				dialOKButton.onclick = function() {
					var selectDrop = document.getElementById("selDrop" + sandboxNum);
					typeConfirm(selectDrop.value);
				};
				break;
            case "bool":
                console.log("bool");
				dialOKButton = document.getElementById("dial" + sandboxNum + "OKButton");
				dialOKButton.onclick = function() {
					var selectDrop = document.getElementById("selDrop" + sandboxNum);
					boolConfirm(selectDrop.value);
                    console.log(selectDrop.value);
                };
				break;
			default:
				break;
		}
		
		dialCancelButton = document.getElementById("dial" + sandboxNum + "CancelButton");
		dialCancelButton.onclick = function() { selectorCancel(); };
	}
    
    function exprConfirm(result){
        switch (result)
        {
            case ('text'):
                createSelector("Text Expressions", tExpr, exprSelConfirm);
//                generateSelectionHTML(tExpr, "expr");
//                $("#selector").dialog('open');
                //console.log(result);
                break;
            case ('numeric'):
                createSelector("Numeric Expressions", nExpr, exprSelConfirm);
//                console.log(result + "ha");
//                generateSelectionHTML(nExpr, "expr");
//                $("#selector").dialog('open');
                //openSelector("Expression choices", nExpr).done(function(returned) {  });
//                console.log(result);
                break;
            default:
                break;
        }
    }

	function delN(name,list){
		for (i = 0; i < list.length; i++)
		{
			if (list[i].toUpperCase() == name.toUpperCase())
			{
				list.splice(i,1);
				break;
			}
		}
	}

	function foundIn(name,list){
        console.log("name: " + name + "\nlist: " + list);
		for (i = 0; i < list.length; i++)
		{
			console.log(list[i].toUpperCase() + " " + name.toUpperCase());
			if (list[i].toUpperCase() == name.toUpperCase())
			{
				console.log("Match found");
				return 1;
			}
		}
		return 0;
	}
	
	function isDummyRow(rowNum) {
		for (var i = 0; i < dummyRows.length; i++) {
			if (dummyRows[i] == rowNum) return true;
		}
		return false;
	}
		
	function removeDummyRow(rowNum) {
		var i;
		for (i = 0; i < dummyRows.length; i++) {
			if (dummyRows[i] == rowNum) break;
		}
		dummyRows.splice(i, 1);
	}

	this.getEditorText = getEditorText;
	function getEditorText() {
		var codeStr = "";
		var row;
		var numCells;
		var cellText;
		var semi;
		var tempText;
		var charCount = -1;
		var lineCount = 0;
		var firstLine = false;
		var firstChar = false;
		var bracketFlag = false;
		var funcCall = false;
		
		for (var i = 0; i < editor.getRowCount(); i++) {
			if (isDummyRow(i)) {
				console.log("Dummy: " + i + " Char Count: " + charCount);
				lineNums.push(i);
				console.log("Pushing: " + (charCount + 1));
				charCountStart.push(charCount + 1);
				codeStr += "dummyFunction();"
				charCount += 16;
				console.log("Pushing: " + charCount);
				charCountEnd.push(charCount);
				removeDummyRow(i);
				i--;
				continue;
			}
		
			row = editor.rowToArray(i);
			console.log(row);
			numCells = row.length;
			if (numCells == 0) { continue; }
			
			if (numCells == 1) {
				if (row[0].indexOf("}") < 0 && row[0].indexOf("{") < 0 && row[0].indexOf("else") < 0) { rowType.push("blankLine"); continue; }
				else bracketFlag = true;
			}
			
//            while()
//            {

                if (row[0].indexOf("function") >= 0) rowType.push("functionDeclaration");
                else if(row[0].indexOf("//") >= 0) rowType.push("comment");
                else if(row.indexOf("{") >= 0) rowType.push("closeBracket");
                else if(row.indexOf("}") >= 0) rowType.push("openBracket");
                else if(row.indexOf("var") >= 0) rowType.push("variable");
                else if(row[1].indexOf("if") >= 0) rowType.push("if");
                else if(row[1].indexOf("else") >= 0) rowType.push("else");
                else if(row[1].indexOf("while") >= 0) rowType.push("while");
                else if(row[1].indexOf("return") >= 0) rowType.push("return");
                else if(row[1].indexOf("for") >= 0) rowType.push("for");
                else if(row[1].indexOf("writeln") >= 0) rowType.push("writeln");
                else if(row[1].indexOf("write") >= 0) rowType.push("write");
                else if(foundIn(row[1],(vFuns.concat(tFuns)).concat(nFuns))) {rowType.push("functionCall"); funcCall = true; console.log("func");/*break; */}
                else if(row[5].indexOf("parse") >= 0) rowType.push("numericPrompt");
                else if(row[7].indexOf("prompt") >= 0) rowType.push("prompt");
                else if(row[3].indexOf("=") >= 0) rowType.push("assignment");
//			else { rowType.push("functionCall"); funcCall = true; }
//                break;
//            }
            
			for (var j = 0; j < numCells; j++) {
				//cellText = innerTable.rows[0].cells[j].textContent;
				if (row[j].indexOf("//") >= 0) break;
				if (row[j].indexOf("document.writeln") >= 0) {
					if (firstChar == false) { firstChar = true; charCountStart.push(charCount + 1); lineNums.push(i); }
					if (!firstLine) firstLine = true;
					codeStr += "document1writeln";
					charCount += 16;
				}
				else if (row[j].indexOf("document.write") >= 0) {
					if (firstChar == false) { firstChar = true; charCountStart.push(charCount + 1); lineNums.push(i); }
					if (!firstLine) firstLine = true;
					codeStr += "document1write";
					charCount += 14;
				}
				else {
					if (row[j].indexOf(";") >= 0) {
						semi = row[j].indexOf(";");
						for (var k = 0; k < semi + 1; k++) tempText += row[j].charAt(k);
						row[j] = tempText;
						firstLine = true;
					}
					
					codeStr += row[j];
					if (firstChar == false && bracketFlag == false) { firstChar = true; charCountStart.push(charCount + 1); lineNums.push(i); }
					if (!firstLine) firstLine = true;
					charCount += row[j].length;
				}
				tempText = "";
			}
			if (firstChar && !bracketFlag) {
				charCountEnd.push(charCount);
			}
			firstChar = false;
			bracketFlag = false;
		}
		
		rowNum = lineNums[0];
		//selRow = rowNum;
		console.log(rowNum);
		editor.setSelectedRow(rowNum);
		
		codeStr = codeStr.replace("\xA0", " ");
		codeStr = codeStr.replace("\x1E", " ");
		var tCodeStr = "";
		for (var i = 0; i < codeStr.length; i++) {
			if (codeStr[i] != "\xA0") tCodeStr += codeStr[i];
			else tCodeStr += " ";
		}
		codeStrLen = tCodeStr.length;
		
		console.log(codeStr);
		console.log(tCodeStr);
		
		return tCodeStr;
	}

	function isNewLine(start, end) {
		if (start == -1 && end == -1) {

			return [ true, rowNum ];
		}
		for (var i = 0; i < charCountStart.length; i++) {
			if (start >= charCountStart[i] && end <= charCountEnd[i] + 1) { 
				if (lineNums[i] == rowNum) { return [ false, rowNum ]; }
				else {
					rowNum = lineNums[i];
					if (rowType[rowNum].indexOf('numeric') >= 0) { promptFlag = [ true, "numeric" ]; }
					else if (rowType[rowNum].indexOf('prompt') >= 0) { promptFlag = [ true, "string" ]; }
					return [true, editor.getSelectedRowIndex()];
				}
			}
		}
		return [ false, rowNum ];
	}

	function checkPromptFlag() {
		if (promptFlag[0]) {
			var type = promptFlag[1];
			var promptStr;
			var defStr;
			promptFlag = [ false, "" ];
			highlightCurrentStep(rowNum);
			var promptStr;
			var firstParam = true;
			var innerTable = codeTable.rows[rowNum].cells[0].children[0];
			for (var i = 2; i < innerTable.rows[0].cells.length; i++) {
				cell = innerTable.rows[0].cells[i];
				if (cell.textContent.indexOf('"') >= 0) {
					promptStr = cell.textContent;
					defStr = innerTable.rows[0].cells[i + 2].textContent;
					return [ true, type, promptStr, defStr ];
				}
			}
		}
		return [ false, "", "", "" ];
	}

	function selectLine(row) {
		/*var innerTable;
		
		for (var i = 0; i < codeTable.rows.length; i++) {
			innerTable = codeTable.rows[i].cells[0].children[0];
			innerTable.rows[0].cells[1].innerHTML = blank;
		}	
		
		innerTable = codeTable.rows[row].cells[0].children[0];
		innerTable.rows[0].cells[1].innerHTML = arrow;
		returnToNormalColor();
		highlightCurrentStep(row);
		selRow = rowNum;*/
		console.log(row);
		editor.selectAndHighlightRowByIndex(row);
	}

	function reset() {
		selectLine(editor.getRowCount() - 1);
		var rowNum = lineNums[0];
		editor.selectRowByIndex(rowNum);
	}

	function getDatatypeSelectedLine() {
		//var innerTable = codeTable.rows[selRow].cells[0].children[0];
		//var numCells = innerTable.rows[0].cells.length;
		var row = editor.rowToArrayHtml(editor.getSelectedRowIndex());
		var numCells = row.length;
		if (row[numCells - 1].indexOf("NUMERIC") >= 0) return "numeric";
		else if (row[numCells - 1].indexOf("NUMERIC") >= 0) return "text";
		
		return null;
	}
	
    /*function addNewInsertRow() {
        var row = insertTable.insertRow(-1);
        var cell = row.insertCell(0);
        cell.className = "insert";
        cell.innerHTML = blank;
    }*/
    
    function fcallType(result) {
        //Function called to allow selection of functions based on a type parameter
        switch (result)
        {
            case ('Void'):
                createSelector("Void Functions", vFuns, fChoose);
                break;
            case ('Text'):
                createSelector("Void Functions", tFuns, fChoose);
                break;
            case ('Numeric'):
                createSelector("Void Functions", nFuns, fChoose);
                break;
            default:
                break;
        }
    }
    
    function textEntry(result) {
        clickedCell.text('"' + result + '"');
    }
    
    function fChoose(result) {
        //Function that is called when selecting a function that replaces the text of a single cell
        clickedCell.text(result);
    }
    
    function enterNum(result) {
        //Function called to replace a cell with a number
        clickedCell.text(result);
    }
    
    function fIDconfirm(result) {
        //Function called to assign an identifier to a function at its declaration
        if (foundIn(result, resWords)) return;
        clickedCell.text(result);
        switch (clickRow[clickedCellNum+5])
        {
            case 'VOID':
                vFuns.push(result);
                break;
            case 'TEXT':
                tFuns.push(result);
                break;
            case 'NUMERIC':
                nFuns.push(result);
                break;
            default:
                break;
        }
        console.log("Names used: " + namesUsed);
        console.log("Void Functions: " + vFuns);
        console.log("Text Functions: " + tFuns);
        console.log("Num Functions: " + nFuns);
    }
    
    function forId(result) {
//        clickedCell.textContent = result;
        console.log(clickRow.length);
		/*
        for (i=0; i<clickRow.length; i++)
        {
            console.log(clickRow[i] + '\n');
            if (clickRow[i].textContent == 'ID') clickRow[i].textContent = result;
        }*/
		
		clickedCell.parent().find('td:contains("ID")').text(result);
		
		//get the clickRow again, since stuff has changed
		clickRow = editor.rowToArrayHtml(clickedCell.parent().parent().parent().parent().parent().index()); //will this work?
    }
    
    function createSelector(title, optionS, callback) {
        var newSel = new Selector();
        newSel.open(title, optionS, callback);
    }
    
    function createStringPad(title, instructions, callback) {
        var newStrP = new StringPad();
        newStrP.open(title, instructions, callback);
    }
    
    function createNumPad(minValue, maxValue, titleStr, instructions, decimalAllowed, base, callback) {
		var newNumpad = new NumberPad();
		newNumpad.open(minValue, maxValue, titleStr, instructions, decimalAllowed, base, callback);
    }

    function createAlertBox(title, msg, bool, callback) {
        var alert = new Alert();
        alert.open(title, msg, bool, callback);
  }
}