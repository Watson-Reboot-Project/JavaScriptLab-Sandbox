/***********************************************************************************
* Author:	Neil Vosburg
* File:		editor.js
*
*			This is the beginnings of an editor for the JavaScript lab. Its purpose
*			is to mimic Watson as it is now.
************************************************************************************/

function Editor(sandboxNum) {
	var codeTable = document.getElementById('fig' + sandboxNum + 'Editor');		// the main table
	var selRow = 0;											// the current selected row
	var blank = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";			// blank template for unselected row
	var arrow = "&nbsp;&#8594;&nbsp;&nbsp;&nbsp;";			// arrow template for selected row
	var indent = "&nbsp;&nbsp;&nbsp;"						// indention used for inside brackets
	var variableCount = 0;									// keeps count of the amount of variables
	var funcCount = 0;										// keeps count of number of functions
	var programStart = 0;									// the line the main program starts
	var programCount = 0;
	var firstMove = false;									// keeps track if the user has added something to the main program
	var innerTableTemplate = "<table class='innerTable'><tr><td>&nbsp;&nbsp;</td><td>" + blank + "</td></tr></table>";	// template used for a newly added row in the codeTable
	var innerTableArrowTemplate = "<table class='innerTable'><tr><td>&nbsp;&nbsp;</td><td>" + arrow + "</td></tr></table>"; // template used for a newly selected row
	var green = "#007500";
	var blue = "#0000FF";
	var black = "#000000";
	var brown = "#a52a2a";
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
	var innerTablet;
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
			row = codeTable.insertRow(i);			// add a new row at the first first postion in the main table
			cell = row.insertCell(0);				// insert a cell in this newly created row
			cell.innerHTML = innerTableTemplate;	// set the cell tot he inner table template (this creates the table within a table)
			innerTable = codeTable.rows[i].cells[0].children[0];	// grab the object of the inner table so we can use JavaScript calls on it

			// depending on the iteraton, we do different things
			if (i == 0) {
					addRow(innerTable, [ "//&nbsp;", "Scratch Pad" ], 2);
					addRowStyle(innerTable, [ green, green ], 2); }	// first iteration: add "// Scratch Pad" to the first row, style it
			else if (i == 1) addRow(innerTable, [ "&nbsp;" ], 2);	// on the second iteration, add a blank line (separate row)
			else if (i == 2) {
					addRow(innerTable, [ "//&nbsp;", "Main Program" ], 2);
					addRowStyle(innerTable, [ green, green ], 2);
			}
		}

		addNewInsertRow();
		// make a blank row where the program starts (this could have been in the for loops above)
		row = codeTable.insertRow(3);	// make a new row
		cell = row.insertCell(0);		// make a new cell here
		cell.innerHTML = innerTableArrowTemplate;	// set the cell with arrow template
		programStart = 3;				// increate the program start to 2
		selRow = 3;						// selected row is line 2
		programCount = 3;
		refreshLineCount();				// refresh the line count along the left margin
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

	toggleEvents(); // initialize events
	
	function returnToNormalColor() {
		for (var i = 0; i < codeTable.rows.length; i++) {
			var innerTable = codeTable.rows[i].cells[0].children[0];										// grab the inner table for this table data object
			var numCells = innerTable.rows[0].cells.length													// grab the number of cells in this inner table

			// we must look for special characters/keywords that let us now we need to re-color cells in that row
			if (numCells >= 3 && innerTable.rows[0].cells[2].innerHTML.indexOf("//") >= 0) {				// a comment? it needs to be green
				for (var j = 0; j < 2; j++) innerTable.rows[0].cells[j].style.color = black;				// first two cells are number and blank space (or possibly an arrow)
				for (var j = 2; j < numCells; j++) innerTable.rows[0].cells[j].style.color = green;			// last cells are the comment, make it green
			}
			else if (numCells >= 3 && innerTable.rows[0].cells[2].innerHTML.indexOf("function") >= 0) {		// a function declaration? function needs to be blue
				for (var j = 0; j < numCells; j++) {
					if (j == 2 || j == 8 || j == 9 || j == 10) innerTable.rows[0].cells[j].style.color = blue;								// color "function" blue
					else innerTable.rows[0].cells[j].style.color = black;									// the rest black
				}
			}
			else if (numCells == 9 && innerTable.rows[0].cells[2].innerHTML.indexOf("var") >= 0) {			// a variable declaration? (num cells = 7) var needs to be blue
				for (var j = 0; j < numCells; j++) {
					if (j == 2 || j == 6 || j == 7 || j == 8) innerTable.rows[0].cells[j].style.color = blue;								// make var blue
					else innerTable.rows[0].cells[j].style.color = black;									// the rest black
				}
			}
			else if (numCells > 9 && innerTable.rows[0].cells[2].innerHTML.indexOf("var") >= 0) {			// an array declaration? (num cells > 7) var needs to be blue, new needs to be blue
				for (var j = 0; j < numCells; j++) {
					if (j == 2 || j == 6 || j == 12 || j == 13 || j == 14) innerTable.rows[0].cells[j].style.color = blue;					// make var and new blue
					else if (j == 11 || j == 12) innerTable.rows[0].cells[j].style.color = green;			// make comment green
					else innerTable.rows[0].cells[j].style.color = black;									// the rest black
				}
			}
			else if (numCells >= 3 && cellContainsKeyword(innerTable, 2)) {									// any keywords? (if, while, else, for, etc) ?
				for (var j = 0; j < numCells; j++) {
					if (j == 2) innerTable.rows[0].cells[j].style.color = blue;								// make the keyword blue
					else innerTable.rows[0].cells[j].style.color = black;									// the rest black
				}
			}
			else if (numCells > 3 && innerTable.rows[0].cells[3].innerHTML.indexOf("write") >= 0) {
				for (var j = 0; j < numCells; j++) {
					if (j == 3)	innerTable.rows[0].cells[j].style.color = blue;
					else if (j == 5) {
						if (innerTable.rows[0].cells[j].textContent.indexOf('"') >= 0) innerTable.rows[0].cells[j].style.color = brown;
						else innerTable.rows[0].cells[j].style.color = black;
					}
					else innerTable.rows[0].cells[j].style.color = black;
				}
			}
			else if (numCells > 7 && innerTable.rows[0].cells[7].innerHTML.indexOf("parse") >= 0) {
				for (var j = 0; j < numCells; j++) {
					if (j == 7 || j == 9) innerTable.rows[0].cells[j].style.color = blue;
					else if (j == 11 || j == 13) {
						if (innerTable.rows[0].cells[j].textContent.indexOf('"') >= 0) innerTable.rows[0].cells[j].style.color = brown;
						else innerTable.rows[0].cells[j].style.color = black;
					}
					else innerTable.rows[0].cells[j].style.color = black;
				}
			}
			else if (numCells > 7 && innerTable.rows[0].cells[7].innerHTML.indexOf("prompt") >= 0) {
				for (var j = 0; j < numCells; j++) {
					if (j == 7) innerTable.rows[0].cells[j].style.color = blue;
					else if (j == 9 || j == 11) {
						if (innerTable.rows[0].cells[j].textContent.indexOf('"') >= 0) innerTable.rows[0].cells[j].style.color = brown;
						else if (innerTable.rows[0].cells[j].textContent != "EXPR") innerTable.rows[0].cells[j].style.color = brown;
						else innerTable.rows[0].cells[j].style.color = black;
					}
					else innerTable.rows[0].cells[j].style.color = black;
				}
			}
			else {
				for (var j = 0; j < numCells; j++) {														// the rest is black
					innerTable.rows[0].cells[j].style.color = "#000000";
				}
			}
		}

		codeTable.style.cursor = 'default';
	}

	// we must refresh the events upon each change within the tables... toggleEvents() is called each time something is altered
	function toggleEvents() {
		$('.innerTable').off('mouseover');						// turn off mouseover event

		$('.innerTable').on('mouseover', 'td', function(){		// turn it back on
			cellVal = $(this).text();							// grab the hovered cell's value
			colNum = ($(this).index());							// grab the hovered cell's index
			var rowNum = ($(this).parent().parent().parent().parent().parent().index());	// grab the row number from codeTable (this is a silly way of doing it, but it works)
			
			var innerTable = codeTable.rows[rowNum].cells[0].children[0];
			var numCells = innerTable.rows[0].cells.length;
			// depending on what cell the mouse if over, highlight accordingly
			// go look at the functions getting called here to understand what is going on
			// we pass rowNum and colNum to tell the function where start highlighting
			if (cellVal.indexOf("while") >= 0) highlightControlStructure(rowNum, colNum);
			else if (cellVal.indexOf("if") >= 0) highlightControlStructure(rowNum, colNum);
			else if (cellVal.indexOf("function") >= 0) highlightControlStructure(rowNum, colNum);
			else if (cellVal.indexOf("for") >= 0) highlightControlStructure(rowNum, colNum);
			else if (cellVal.indexOf('{') >= 0) highlightControlStructure(rowNum - 1, 0); 	// start highlighting a line before the '{'
			else if (cellVal.indexOf('(') >= 0) highlightParenthesis('(', ')', rowNum, colNum);	// must highlight backwards if we land on a '}'
			else if (cellVal.indexOf('}') >= 0) highlightControlStructureBackwards(rowNum, colNum);
			else if (cellVal.indexOf(')') >= 0)	highlightParenthesisBackwards('(', ')', rowNum, colNum);
			else if(cellVal.indexOf('var') >= 0 || cellVal.indexOf(';') >= 0 || cellVal.indexOf('//') >= 0) highlightLine(rowNum, colNum);
			else if(numCells >= colNum + 2 && innerTable.rows[0].cells[colNum + 1].textContent.indexOf("(") >= 0) highlightParenthesis("(", ")", rowNum, colNum);
			else highlightCell(rowNum, colNum);
		});

		$('.innerTable').off('mouseout');					// toggle mouseout event

		// we must put the cells we highlight red back to their normal state after we mouseout of them
		$('.innerTable').on('mouseout', 'td', function(){
			returnToNormalColor();
		});

		$('.innerTable').off('click');						// toggle click event

		$(".innerTable").on('click','td',function(e) {		// the click event on a table data object
			var cellVal = $(this).text();					// grab the cell value of clicked cell
			var cellNum = $(this).index();					// grab the cell number of clicked cell
			var rowNum = ($(this).parent().parent().parent().parent().parent().index());	// grab row number in codeTable of clicked cell

			/* Weston variables */
			innerTablet = codeTable.rows[rowNum].cells[0].children[0];
			clickedCell = innerTablet.rows[0].cells[cellNum];
			clickedCellNum = cellNum;

			// if we click the number of the line (very left cell in each row), we try to delete something
			if (cellNum == 0) {
				var innerTable = codeTable.rows[rowNum].cells[0].children[0];
				var row = innerTable.rows[0].cells[2].innerHTML;

				// Users are not allowed to delete some specific rows
				// Example a)Empty Rows b)Comments c)Curly Braces
				if (rowNum < 2 || row == '&nbsp;' || row == '//&nbsp;' || row.match('{') || row.match('}')) {
					return;
				}
				// User should not be able to delete else statement because it is a part of if function
				else if (rowContainsString(codeTable, rowNum, "else"))
					return;
				else {
					// If the next line has '{' then the whole block should be deleted
					if (rowContainsString(codeTable, rowNum+1, "{"))	{
						// To determine if the selected row is inside the code block or not.
						var isSelRowInside = false;
						// isFunction determines if the current row being deleted is a function or not
						// to remove the trailing empty row.
						var isFunction = false;
						// If the row contains the keyword function
						// Decrease the function count
						var bracketFound = 0;

						if (rowContainsString(codeTable, rowNum, "function")) {
							funcCount--;
							isFunction = true;
						}

						// Initialize the tableRowCount to 0 because
						// we are iterating starting at the rowNum.
						// This tableRowCount keeps track of the number of rows inside the code block.
						var tableRowCount = 0;

						// Iterate throughout the table, starting at rowNum
						// Exit when '}' is found
						for (var i = rowNum; i <= codeTable.rows.length; i++) {
							// Increase the tableRowCount
							tableRowCount++;

							// If the selected row is inside this current function
							// set isSelRowInside to true and continue.
							if(selRow == i) {
								isSelRowInside = true;
								continue;
							}
							// To remove the codeblock within a code block
							else if (rowContainsString(codeTable, i, "{")) {
								bracketFound++;
							}
							// If matching '}' is found then exit out
							else if (rowContainsString(codeTable, i, "}")) {
								if (bracketFound > 0) {
									bracketFound--;

									var tempRowNum = i+1;
										if (rowContainsString(codeTable, tempRowNum, "else")) {
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
							moveToLine(i);
							// Reduce the tableRowCount because selecting another row automatically deletes the current row.
							tableRowCount--;
							isSelRowInside = false;
						}

						// Now start deleting the rows starting at rowNum
						for (var i = 1; i <= tableRowCount; i++) {
							deleteOneLineElement(rowNum);
						}

						// If we are removing a function then also delete the trailing empty row
						if (isFunction) {
							deleteOneLineElement(rowNum);
							// If we are deleting the last function then remove the comment too
							if (funcCount == 0) {
								deleteOneLineElement(rowNum-1);
							}
							// Mover to the end of the program because we are not allowed
							// to edit the variable section
							moveToLine(programCount);
							isFunction = false;
						}
					}
					// This section basically removes the one one line element.
					else {
						// If the deleted row contains "var" then a variable is being removed from the table
						// subtract -1 from the variableCount
					if (rowContainsString(codeTable, rowNum, "var")) {
							var innerTable = codeTable.rows[rowNum].cells[0].children[0];
							// Grab the variable name
							var cellContent = innerTable.rows[0].cells[4].textContent;
							// Grab the variable type
							var cellContentType = innerTable.rows[0].cells[7].textContent;

							if (referenceCheck(cellContent, rowNum)) {
								var warning = "You must not reference this variable if you want to delete it.";
								createAlertBox("Notice", warning, true, null);
								//createSelector("Select Type", ftypes, ftypeConfirm);
								return;
							}

							// If we are removing a text variable then remove the variable from the text variable list
							if (cellContentType === "TEXT") {
									var index = tvars.indexOf(cellContent);
									tvars.splice(index, 1);
							}
							// If we are removing a numeric variable then remove the variable from the numeric variable list
							if (cellContentType === "NUMERIC") {
									var index = nvars.indexOf(cellContent);
									nvars.splice(index, 1);
							}
							variableCount--;
							// Delete the current row
							deleteOneLineElement(rowNum);

							// Remove the variable comment if no variable exists
							if (variableCount == 0) {
								// We have to iterate twice to remove the empty space
								// which is at the bottom of the variable section.
								for (var i = 1; i <= 2; i++) {
									// Delete the second row because the variable comment if exists
									// is always at row 2.
									deleteOneLineElement(2);
								}
							}
						} else
									// Delete the current row	
									deleteOneLineElement(rowNum);
					}
				}

				// Conditions to move the selRow either in or out of the code block
				var innerTable = codeTable.rows[rowNum-1].cells[0].children[0];
				if (innerTable.rows[0].cells.length == 2 || innerTable.rows[0].cells[2].innerHTML == "/*&nbsp;") {
					moveToLine(programCount);
					}
					refreshLineCount();
					return;
			}

			if (selRow == rowNum) return;			// the selected row was clicked? do nothing
			if (rowNum < variableCount) return;		// we don't allow users to move into variables section

		// if the cell value is a blank (5 non-breaking spaces '\xA0'), we try to move to that location
		/*	if (cellVal == '\xA0\xA0\xA0\xA0\xA0') {
										var innerTable = codeTable.rows[rowNum].cells[0].children[0];		// grab the inner table of this row
										if (checkValidRow(innerTable.rows[0], rowNum) == false) return;		// check to see if this is a valid position
										moveToLine(rowNum);												// move to line if we make it here
							}
		*/
			/* Weston's dialogs */
            if (cellVal == 'TYPE' || cellVal == 'TEXT' || cellVal == 'NUMERIC' || cellVal == 'VOID')
            {
                if (innerTablet.rows[0].cells[cellNum-7].textContent == 'function')
                {
                    console.log("looking at a function type");
                    if (foundIn(innerTablet.rows[0].cells[cellNum-5].textContent, namesRef))
                    {
                        console.log("Can't change type. Is reffed.\n");
                    }
                    else
                    {
                        console.log("not reffed.");
                        if (foundIn(innerTablet.rows[0].cells[cellNum-5].textContent, namesUsed))
                        {
                            console.log("used.");
                            delN(innerTablet.rows[0].cells[cellNum-5].textContent, nFuns);
                            delN(innerTablet.rows[0].cells[cellNum-5].textContent, tFuns);
                            delN(innerTablet.rows[0].cells[cellNum-5].textContent, vFuns);
                            delN(innerTablet.rows[0].cells[cellNum-5].textContent, namesUsed);
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
                else if (innerTablet.rows[0].cells[cellNum-5].textContent == 'var')
                {
                    if (foundIn(innerTablet.rows[0].cells[cellNum-3].textContent, namesRef))
                    {
                        console.log("Can't change type. Is reffed.\n");
                    }
                    else
                    {
                        console.log("not reffed.");
                        if (foundIn(innerTablet.rows[0].cells[cellNum-3].textContent, namesUsed))
                        {
                            console.log("used.");
                            delN(innerTablet.rows[0].cells[cellNum-3].textContent, nvars);
                            delN(innerTablet.rows[0].cells[cellNum-3].textContent, tvars);
                            delN(innerTablet.rows[0].cells[cellNum-3].textContent, namesUsed);
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
                else if (innerTablet.rows[0].cells[cellNum-11].textContent == 'var')
                {
                    console.log("array?");
                    if (foundIn(innerTablet.rows[0].cells[cellNum-9].textContent, namesRef))
                    {
                        console.log("Can't change type. Is reffed.\n");
                    }
                    else
                    {
                        console.log("not reffed.");
                        if (foundIn(innerTablet.rows[0].cells[cellNum-9].textContent, namesUsed))
                        {
                            console.log("used.");
                            delN(innerTablet.rows[0].cells[cellNum-9].textContent, nvars);
                            delN(innerTablet.rows[0].cells[cellNum-9].textContent, tvars);
                            delN(innerTablet.rows[0].cells[cellNum-9].textContent, namesUsed);
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
                            else if (cellVal == 'ID' && foundIn(innerTablet.rows[0].cells[cellNum-3].textContent,compKeys))
                            {
                            //Choosing the left side of a comparison in a while or if
                            createSelector("Choose an identifier.", namesUsed, idConfirm);
                            }
                            
                            else if (cellVal == 'ID' && innerTablet.rows[0].cells[cellNum-2].textContent == 'function')
                            {
                            //Assigning an identifier to a function
                            createStringPad("Function ID", "Please name the function.", fIDconfirm);
                            }
                            
                            else if (cellVal == 'FUNCTION') {
                            //Calling a function
                            createSelector("Function Call", ftypes, fcallType);
                            }
                            
                            else if (cellVal == 'size')
                            {
                            //Choosing a size for an Array
                            createNumPad(0,null,"Array Size", "Enter a size for the array.", false, 10, enterNum);
                            }
                            /*Weston edit end*/
            
			else if (cellVal == 'ID' && innerTablet.rows[0].cells[2].textContent == 'var') {
                            createStringPad("Variable ID", "Please name the variable", nameDialogConfirm);
			}
			else if (cellVal == 'ID' && innerTablet.rows[0].cells[cellNum+2].textContent == '=')
			{
//                            console.log('ID');
                            createSelector("Choose a variable to assign.", namesUsed, idConfirm);
			}
			
//			if (foundIn(cellVal, tvars) == 1) {
//					$("#selector").empty();
//					dial.innerHTML = "<textarea id='dial" + sandboxNum + "Text' size=\"4\" style=\"width: 100%;margin-bottom:10px\"></textarea> <div> <button id='dial" + sandboxNum + "OKButton' type=\"button\" style=\"width:4em;height:2em\">Okay</button> <button id='dial" + sandboxNum + "CancelButton' type=\"button\" style = \"width:4em;height:2em\">Cancel</button> </div>";
//					
//					dialOKButton = document.getElementById("dial" + sandboxNum + "OKButton");
//					dialOKButton.onclick = function() {
//						var textArea = document.getElementById("dial" + sandboxNum + "Text");
//						nameDialogConfirm(textArea.value);
//					};
//					
//					dialCancelButton = document.getElementById("dial" + sandboxNum + "CancelButton");
//					dialCancelButton.onclick = function() {	selectorCancel(); };
//					
//					$("#selector").dialog('open');
//					
//					console.log(innerTablet.rows[0].cells[2].textContent);
//					if (innerTablet.rows[0].cells[7].textContent == 'TEXT') {
//									var index = tvars.indexOf(cellVal);
//									tvars.splice(index, 1);
//									console.log(tvars);
//					}		
//					else if (innerTablet.rows[0].cells[7].textContent === 'NUMERIC') {
//									console.log("got here");
//									var index = nvars.indexOf(cellVal);
//									nvars.splice(index, 1);
//									console.log(nvars);
//					}
//			}
			
			});
	
   /** Implementation for '>' **/
		// Display the > sign when hovered over the very left cell
		$(".insert").off("mouseover");
		$(".insert").on("mouseover", function() {
				// Grab the the row number so as to edit the editor
				var insertRowNum = $(this).parent().index();
				// Increase the insertRowNum because we want to enter the new statement
				// in the next line in the code window.
				insertRowNum++;
					
				if (selRow == insertRowNum-1) {
						$(this).css('cursor', 'default');
						return;
				}
				
				// Display the cursor at the very bottom of the editor
				if (insertRowNum > programCount) {
						$(this).css('cursor', 'pointer');
						$(this).html(">");
						return;
				}

				// For empty row
				if (codeTable.rows[insertRowNum].cells[0].children[0].rows[0].cells.length == 2) {
						$(this).css('cursor', 'default');
						return;
				}
				
				try {
						var innerTable = codeTable.rows[insertRowNum].cells[0].children[0];
						var cellTwoText = innerTable.rows[0].cells[2].innerText;
				} catch(e) {
						console.log("Error:", e.message);	
				}
				
				// Check if the row is valid or not
				if (checkValidRow(innerTable.rows[0], insertRowNum) == false) {		
						$(this).css('cursor', 'default');
						return;		
				}
				
				// When hovered, display the cursor
				$(this).css('cursor', 'pointer');
				$(this).html(">");
		});
		
		/** Remove the cursor when the mouse is moved away. **/
		$(".insert").off("mouseout");
		$(".insert").on("mouseout", function() {
				$(this).css('cursor', 'default');
				$(this).html(blank);
		});
		
		/** When a cell is clicked, moved to the corresponding row. **/
		$(".insert").off("click");
		$(".insert").on("click", function() {
				// Grab the the row number so as to edit the editor
				var insertRowNum = $(this).parent().index();
				// Increase the insertRowNum because we want to enter the new statement
				// in the next line in the code window.
				insertRowNum++;
				
				if (selRow == insertRowNum-1) {
						return;
				}
								
				// Move to the bottom of the editor
				if (insertRowNum > programCount) {
						moveToLine(programCount);
						return;
				}
				
				// Condition to ensure the insertion is done only at the bottom of the row
				if (codeTable.rows[insertRowNum].cells[0].children[0].rows[0].cells.length == 2) {
						return;
				}
				
				// Grab the inner table from the code window
				try {
						var innerTable = codeTable.rows[insertRowNum].cells[0].children[0];
						var cellTwoText = innerTable.rows[0].cells[2].innerText;
				} catch(e) {
						console.log(e);	
				}
				
				//Check to see if this is a valid position
				if (checkValidRow(innerTable.rows[0], insertRowNum) == false) {		
						return;		
				}
				
				// If all condition is passed move to the specified line
				if (insertRowNum > selRow) {
						moveToLine(insertRowNum-1);
				}
				else
						moveToLine(insertRowNum);
		});
}

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
	
	function highlightCurrentStep(rowNum) {
		highlightStart = rowNum;
		var innerTable = codeTable.rows[rowNum].cells[0].children[0];
		if (innerTable.rows[0].cells.length <= 2) return;
		var cellText = innerTable.rows[0].cells[2];
		if (containsControlStructure(cellText.textContent)) {
			highlightControlStructure(rowNum);
		}
		else {
			highlightLine(rowNum);
		}
	}

	// check to see if a specific cell contains a keywords; return true if so
	function cellContainsKeyword(table, cellNo) {
		if (table.rows[0].cells[cellNo].innerHTML.indexOf("while") >= 0) return true;
		if (table.rows[0].cells[cellNo].innerHTML.indexOf("if") >= 0) return true;
		if (table.rows[0].cells[cellNo].innerHTML.indexOf("else") >= 0) return true;
		if (table.rows[0].cells[cellNo].innerHTML.indexOf("for") >= 0) return true;
		if (table.rows[0].cells[cellNo].innerHTML.indexOf("return") >= 0) return true;

		return false;
	}

	// move to a specified row
	function moveToLine(rowNum) {
		var newRow;
		var cell;

		codeTable.deleteRow(selRow);				// delete the current selected row
		newRow = codeTable.insertRow(rowNum);		// insert a new row at row number specified
		cell = newRow.insertCell(0);				// insert a new cell in new row just created
		cell.innerHTML = innerTableArrowTemplate;	// insert the innerTable template with arrow
		selectRow(rowNum);	// make this the new selected row

		refreshLineCount();							// refresh the line count along the side
	}

	// highlight one cell red at a specific row and column
	function highlightCell(rowInd, colInd) {
		var innerTable = codeTable.rows[rowInd].cells[0].children[0];	// grab the inner table at the specified row
		innerTable.rows[0].cells[colInd].style.color = "#FF0000";		// color the cell red at specific column
	}

	// highlightControlStructure() looks for matching braces '{' and '}'. Once the braces match up. it stops highlighting
	function highlightControlStructure(rowInd, colInd) {
		var bracket = 1;			// bracket found initialized to 1 so the while loops executes
		var numCells;				// number of cells in the current row
		var firstBrack = false;		// first bracket found flag; since bracket is initialized to one, the first bracket doesn't count

		for (var i = rowInd; i < codeTable.rows.length; i++) {								// iterate throughout rows starting at the specified index
			var innerTable = codeTable.rows[i].cells[0].children[0];						// grab the inner table of this row
			var numCells = innerTable.rows[0].cells.length; 								// grab the number of cells in this row
			for (var j = 0; j < numCells; j++) {											// iterate throughout these cells
				if (innerTable.rows[0].cells[j].textContent.indexOf("{") >= 0) {				// if we found a '{'
					if (!firstBrack) firstBrack = true;										// if this is the first bracket, skip it
					else bracket++;															// otherwise, count it
				}
				else if (innerTable.rows[0].cells[j].textContent.indexOf("}") >= 0) {			// if we found a '}'
					bracket--;																// subtract from bracket
				}

				innerTable.rows[0].cells[j].style.color = "#FF0000";						// color the current cell red as we go
			}
			if (bracket == 0) break;														// if we found matching brackets, brackets will be 0, break
		}
	}

	// highlightControlStructureBackwards() looks for match braces '{' and '}' backwards: the same as function above (almost)
	function highlightControlStructureBackwards(rowInd, colInd) {
		var bracket = 1;
		var numCells;
		var firstBrack = false;
		var firstLoop = true;			// a flag to see if we are on the first loop
		var i;
		var innerTable;

		for (i = rowInd; i >= 0; i--) {													// iterate starting at the specified row index
			innerTable = codeTable.rows[i].cells[0].children[0];						// grab the inner table for this row
			numCells = innerTable.rows[0].cells.length									// get the number of cells in this row
			for (var j = numCells - 1; j >= 0; j--) {									// start at num cells - 1
				if (firstLoop == true) { j = colInd; firstLoop = false; }				// if its the first loop, start at the specified column index

				if (innerTable.rows[0].cells[j].textContent.indexOf('{') >= 0) {			// if the cell contains '{', subtract from bracket
					bracket--;
				}
				else if (innerTable.rows[0].cells[j].textContent.indexOf('}') >= 0) {		// if the cell contains '}'
					if (!firstBrack) firstBrak = true;									// if its the first bracket, don't count it
					else bracket++;														// otherwise, count it
				}

				innerTable.rows[0].cells[j].style.color = "#FF0000";					// color the cells along the way
			}

			if (bracket == 0) break;													// break if bracket reaches 0
		}

		// we need to color the row right above where we started as this line contains the actual control structure
		innerTable = codeTable.rows[i - 1].cells[0].children[0];									// grab the row right before where we stopped
		numCells = innerTable.rows[0].cells.length;													// grab the number of cells in that row
		for (var k = 0; k < numCells; k++) innerTable.rows[0].cells[k].style.color = "#FF0000";		// color the row red
	}

	// highlightParenthesis() functions similarly to highlightControlStructure(); highlights parenthesis passed to it '(' and ')'
	function highlightParenthesis(openBracket, closeBracket, rowInd, colInd) {
		var bracket = 1;
		var numCells;
		var firstBrack = false;
		var firstLoop = true;
		var innerTable;

		while (bracket != 0) {
			for (var i = 0; i < codeTable.rows.length; i++) {
				if (firstLoop == true) i = rowInd;
				innerTable = codeTable.rows[i].cells[0].children[0];
				numCells = innerTable.rows[0].cells.length
				for (var j = 0; j < numCells; j++) {
					if (firstLoop == true) { j = colInd; firstLoop = false; }

					if (innerTable.rows[0].cells[j].textContent.indexOf(openBracket) >= 0) {
						if (!firstBrack) firstBrack = true;
						else bracket++;
					}
					else if (innerTable.rows[0].cells[j].textContent.indexOf(closeBracket) >= 0) {
						bracket--;
					}

					innerTable.rows[0].cells[j].style.color = "#FF0000";

					if (bracket == 0) break;
				}

				if (bracket == 0) break;
			}
		}
	}

	// highlightParenthesisBackwards() functions similarly to highlightControlStructureBackwards()
	function highlightParenthesisBackwards(openBracket, closeBracket, rowInd, colInd) {
		var bracket = 1;
		var numCells;
		var firstBrack = false;
		var firstLoop = true;
		var innerTable;

		while (bracket != 0) {
			for (var i = codeTable.rows.length - 1; i >= 0; i--) {
				if (firstLoop == true) i = rowInd;
				innerTable = codeTable.rows[i].cells[0].children[0];
				numCells = innerTable.rows[0].cells.length
				for (var j = numCells - 1; j >= 0; j--) {
					if (firstLoop == true) { j = colInd; firstLoop = false; }

					if (innerTable.rows[0].cells[j].textContent.indexOf(openBracket) >= 0) {
						bracket--;
					}
					else if (innerTable.rows[0].cells[j].textContent.indexOf(closeBracket) >= 0) {
						if (!firstBrack) firstBrack = true;
						else bracket++;
					}

					innerTable.rows[0].cells[j].style.color = "#FF0000";

					if (bracket == 0) break;
				}

				if (bracket == 0) break;
			}
		}
	}

	// highlightLine() simply highlights the row with the row index passed to it
	function highlightLine(rowInd, colInd) {
		var innerTable = codeTable.rows[rowInd].cells[0].children[0];	// grab the inner table at this index
		var numCells = innerTable.rows[0].cells.length;					// grab the number of cells for this row
		for (var i = 0; i < numCells; i++) {							// iterate throughout the cells
			innerTable.rows[0].cells[i].style.color = '#FF0000';		// highlight all cells red
		}
	}

	// addVariable() is responsible for adding a variable/array declaration
	function addVariable(element) {
		var row;
		var cell;
		var innerTable;

		if (variableCount == 0) {															// if there are no variables initialized yet
			for (var i = 0; i < 2; i++) {													// iterate twice
				row = codeTable.insertRow(variableCount + 2 + i);							// insert a new row at variableCount + 2 + i (two lines for '// Scratch Pad' and blank line following)
				cell = row.insertCell(0);													// insert a new cell here
				cell.innerHTML = innerTableTemplate;										// put the innerTableTemplate in the new cell
				innerTable = codeTable.rows[variableCount + 2 + i].cells[0].children[0];	// grab the innerTable object we just created

				if (i == 0) addRow(innerTable, [ "//&nbsp;", "Variables" ], 2);				// the first iteration: add '// Variables'
				else if (i == 1) addRow(innerTable, [ "&nbsp;" ], 2);						// the second iteration: add a blank line

				programStart++;	// increase the program start line
				selRow++;		// increase the selected row
				programCount++;
			}
		}

		var row = codeTable.insertRow(variableCount + 3);							// insert a new row for the actual declaration; (variableCount + 3) because of '// Scratch Pad', blank line, and '//Variables'
		var cell = row.insertCell(0);												// insert a new cell at the row
		cell.innerHTML = innerTableTemplate;										// insert our inner table template
		var innerTable = codeTable.rows[variableCount + 3].cells[0].children[0];	// grab the inner table object we just created

		// if the element is a variable
		if (element == "variable") {
			addRow(innerTable, ["var", "&nbsp;", "ID", ";&nbsp;", "&nbsp;/*", "TYPE", "*/" ], 2);	// add the row
			addRowStyle(innerTable, [ blue, black, black, black, blue, blue, blue ], 2);							// style the row accordingly
		}
		else if (element == "array") {	// if its an array
			addRow(innerTable, ["var", "&nbsp;", "ID", "&nbsp;=&nbsp;", "new&nbsp;", "Array", "(", "size", ")", ";", "&nbsp;/*", "TYPE", "*/"], 2);	// add the row
			addRowStyle(innerTable, [ blue, black, black, black, blue, black, black, black, black, black, blue, blue, blue ], 2);											// style it accordingly
		}

		selRow++;			// increase the selected row
		variableCount++;	// increase the variable count
		programStart++;		// increase the program start line
		programCount++;
		toggleEvents();		// toggle events to refresh the newly created row
		refreshLineCount();	// refresh the line count
	}

	// addOneLineElement() is responsible for adding elements that only require one line (excluding variable and array declarations)
	function addOneLineElement(element) {
		//if this is the very first move to add to the main program, add the main program comment
		//if (!firstMove) {
		//	addMainProgramComment();
			firstMove = true;
		//}

		var indentStr = findIndentation(selRow);	// get the correct indentation

		var row = codeTable.insertRow(selRow);		// get the selected row from the main codeTable
		var cell = row.insertCell(0);				// make a new cell here
		cell.innerHTML = innerTableTemplate;		// put our inner table template in the new cell
		var innerTable = codeTable.rows[selRow].cells[0].children[0];	// grab the inner table over we just created

		// depending on which element it is, format the row correspondingly
		if (element == "assignment") addRow(innerTable, [ indentStr, "ID", "&nbsp;", "=", "&nbsp", "EXPR", ";"], 2);
		else if (element == "write") {
			addRow(innerTable, [ indentStr, "document.write", "(", "EXPR", ")", ";" ], 2);
			addRowStyle(innerTable, [ black, blue, black, black, black, black ], 2);
		}
		else if (element == "writeln") {
			addRow(innerTable, [ indentStr, "document.writeln", "(", "EXPR", ")", ";" ], 2);
			addRowStyle(innerTable, [ black, blue, black, black, black, black ], 2);
		}
		else if (element == "stringPrompt") {
			addRow(innerTable, [ indentStr, "ID", "&nbsp;", "=", "&nbsp;", "prompt", "(", "EXPR", ",&nbsp;", "EXPR", ")", ";" ], 2);
			addRowStyle(innerTable, [ black, black, black, black, black, blue, black, black, black, black, black ], 2);
		}
		else if (element == "numericPrompt") {
			addRow(innerTable, [ indentStr, "ID", "&nbsp;", "=", "&nbsp;", "parseFloat", "(", "prompt", "(", "EXPR", ",", "EXPR", ")", ")", ";" ], 2);
			addRowStyle(innerTable, [ black, black, black, black, black, blue, black, blue, black, black, black, black, black ], 2);
		}
		else if (element == "functionCall") {
			addRow(innerTable, [ indentStr, "FUNCTION", "(", ")", ";" ], 2);
		}
		else if (element == "return") {
			addRow(innerTable, [ indentStr, "return", "&nbsp;", "EXPR", ";" ], 2);
			addRowStyle(innerTable, [ "blue", "black", "black" ], 2);
		}

		selectRow(selRow+1);				// increase the selected row by one

		if (selRow < programStart) programStart++;		// if the selected row is less than the program start line (editing a function), increase program start
		programCount++;
		toggleEvents();									// toggle events to refresh them
		refreshLineCount();								// and also refresh line count
	}

	// addIfThen() is responsible for adding an If/Then control structure
	function addIfThen() {
		// if this is the first move the user has made toward the main program, put the main program comment
		//if (!firstMove) {
		//	addMainProgramComment();
			firstMove = true;
		//}
		var indentStr = findIndentation(selRow);	// get the correct indentation
		var row;
		var cell;
		var innerTable;

		for (var i = 0; i < 3; i++) {											// iterate three times
			row = codeTable.insertRow(selRow + i);								// create a new row at selRow + i
			cell = row.insertCell(0);											// create a new cell in the newly created row
			cell.innerHTML = innerTableTemplate;								// put our inner table template here
			innerTable = codeTable.rows[selRow + i].cells[0].children[0];		// get the newly created inner table object

			// add the row on one line, a '{' on the second line, and '}' on the third
			if (i == 0) { addRow(innerTable, [ indentStr + "if", "&nbsp;", "(", "EXPR", ")" ], 2); addRowStyle(innerTable, [ "blue", "black", "black", "black" ], 2); }
			else if (i == 1) addRow(innerTable, [ indentStr + "{" ], 2);
			else if (i == 2) addRow(innerTable, [ indentStr + "}" ], 2);
		}

		selectRow(selRow + 3);								// increase the selected row by 3 (added three items)

		if (selRow <= programStart) programStart += 3;		// if the selected row is less than the program start (editing a function), increase program start by 3
		programCount+=3;
		toggleEvents();										// toggle events
		refreshLineCount();									// refresh the line count
	}

	// addIfElse() is very similar to addIfThen() except we add the 'else'
	function addIfElse() {
		//if (!firstMove) {
		//	addMainProgramComment();
			firstMove = true;
		//}
		var indentStr = findIndentation(selRow);
		var row;
		var cell;
		var innerTable;

		for (var i = 0; i < 6; i++) {
			row = codeTable.insertRow(selRow + i);
			cell = row.insertCell(0);
			cell.innerHTML = innerTableTemplate;
			innerTable = codeTable.rows[selRow + i].cells[0].children[0];

			if (i == 0) { addRow(innerTable, [ indentStr + "if", "&nbsp;", "(", "EXPR", ")" ], 2); addRowStyle(innerTable, [ "blue", "black", "black", "black" ], 2); }
			else if (i == 1) addRow(innerTable, [ indentStr + "{" ], 2);
			else if (i == 2) addRow(innerTable, [ indentStr + "}" ], 2);
			else if (i == 3) { addRow(innerTable, [ indentStr + "else" ], 2); addRowStyle(innerTable, [ "blue", ], 2); }
			else if (i == 4) addRow(innerTable, [ indentStr + "{" ], 2);
			else if (i == 5) addRow(innerTable, [ indentStr + "}" ], 2);
		}

		selectRow(selRow + 6);

		if (selRow <= programStart) programStart += 6;
		programCount += 6;
		toggleEvents();
		refreshLineCount();
	}

	// addWhile() is very similar to adding any other structure
	function addWhile() {
		//if (!firstMove) {
		//	addMainProgramComment();
			firstMove = true;
		//}
		var indentStr = findIndentation(selRow);
		var row;
		var cell;
		var innerTable;

		for (var i = 0; i < 3; i++) {
			row = codeTable.insertRow(selRow + i);
			cell = row.insertCell(0);
			cell.innerHTML = innerTableTemplate;
			innerTable = codeTable.rows[selRow + i].cells[0].children[0];

			if (i == 0) { addRow(innerTable, [ indentStr + "while", "&nbsp;", "(", "EXPR", ")" ], 2); addRowStyle(innerTable, [ "blue", "black", "black", "black" ], 2); }
			else if (i == 1) addRow(innerTable, [ indentStr + "{" ], 2);
			else if (i == 2) addRow(innerTable, [ indentStr + "}" ], 2);
		}

		selectRow(selRow + 3);

		if (selRow <= programStart) programStart += 3;
		programCount += 3;
		toggleEvents();
		refreshLineCount();
	}

	// addFor() adds a for loop to the current selected line just like addWhile()
	function addFor() {
		//if (!firstMove) {
		//	addMainProgramComment();
			firstMove = true;
		//}
		var indentStr = findIndentation(selRow);
		var row;
		var cell;
		var innerTable;

		for (var i = 0; i < 3; i++) {
			row = codeTable.insertRow(selRow + i);
			cell = row.insertCell(0);
			cell.innerHTML = innerTableTemplate;
			innerTable = codeTable.rows[selRow + i].cells[0].children[0];

			if (i == 0) {
				addRow(innerTable, [ indentStr + "for&nbsp;", "(", "ID&nbsp;", "=&nbsp;", "EXPR", ";&nbsp;", "ID&nbsp;", "&lt;&nbsp;", "EXPR", ";&nbsp;", "ID", "++", ")" ], 2);
				addRowStyle(innerTable, [ "blue", "black", "black", "black", "black", "black", "black", "black", "black", "black", "black", "black", "black" ], 2);
			}
			else if (i == 1) addRow(innerTable, [ indentStr + "{" ], 2);
			else if (i == 2) addRow(innerTable, [ indentStr + "}" ], 2);
		}

		selectRow(selRow + 3);

		if (selRow <= programStart) programStart += 3;
		programCount += 3;
		toggleEvents();
		refreshLineCount();
	}

	// addFunction() adds a new function declaration before the program start and after the variables declarations
	function addFunction() {
		var row;
		var cell;
		var innerTable;
		var beginRow;
        
		// if the user hasn't edited the main program OR selected row is less than program start, we begin at the program start line
		//if (firstMove) {
		if (selRow < programStart) {
			beginRow = programStart;
		} else
			beginRow = programStart-1;
		//}
        
		//if (!firstMove || selRow < programStart) beginRow = programStart;
		//else beginRow = programStart - 1;	// otherwise, we begin at programStart - 1
        
		// if we haven't added a function yet, we must insert the '// Functions' comment
		if (funcCount == 0) {
            row = codeTable.insertRow(beginRow);							// add the row at the 'beginRow' index
            cell = row.insertCell(0);
            cell.innerHTML = innerTableTemplate;
            innerTable = codeTable.rows[beginRow].cells[0].children[0];
            
            if (selRow >= beginRow) selRow++;								// increase selected row if it is greater or equal to beginRow
            
            addRow(innerTable, [ "//&nbsp;", "Functions" ], 2);
            addRowStyle(innerTable, [ green, green, ], 2);
            beginRow++;
            
            programStart++;	// increase program start line
            programCount++;
		}
        
		// add a blank line at begin row (this creates a blank line after the function declaration)
		row = codeTable.insertRow(beginRow);
		cell = row.insertCell(0);
		cell.innerHTML = innerTableTemplate;
		innerTable = codeTable.rows[beginRow].cells[0].children[0];
		addRow(innerTable, [ "&nbsp;" ], 2);
		programStart++;
		programCount++;
		if (selRow >= beginRow) selRow++;
        
		for (var i = 0; i < 3; i++) {											// iterate three times
			row = codeTable.insertRow(beginRow + i);							// create a row at beginRow
			cell = row.insertCell(0);											// insert a new cell in the row
			cell.innerHTML = innerTableTemplate;								// put our inner table template here
			innerTable = codeTable.rows[beginRow + i].cells[0].children[0];		// grab the innerTable object we just created
            
			// add the row on the first iteration, a '{' on second iteration, and a '}' on third iteration
			if (i == 0) {
				addRow(innerTable, [ "function", "&nbsp;", "ID", "(", ")", "&nbsp;", "/*", "VOID", "*/" ], 2);
				addRowStyle(innerTable, [ blue, black, black, black, black, black, blue, blue, blue ], 2);
			}
			else if (i == 1) addRow(innerTable, [ "{" ], 2);
			else if (i == 2) addRow(innerTable, [ "}" ], 2);
            
			if (selRow >= beginRow + i) selRow++;	// if the selected row is greater than or equal to the current row, increase selected row
		}
		selectRow(selRow);							// make sure the 'selRow' row is selected
        
		programStart += 3;							// increase the program start by 3
		programCount += 3;
		funcCount++;								// increase the function count
		functionList.push("FUNCTION");				// push FUNCTION to the function list
		toggleEvents();								// refresh events
		refreshLineCount();							// refresh the line count
	}

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

	// deleteFunction() checks to see what the element is that is requested to be deleted, and deletes that element
	function deleteFunction(rowNum, colNum) {
		var innerTable = codeTable.rows[rowNum].cells[0].children[0];			// grab the inner table that needs to be deleted

		if (isOneLineElement(innerTable.rows[0])) deleteOneLineElement(rowNum);	// if its a one line element, delete it
	}

	// deleteOneLineElement() is responsible for appropriately deleting an element that takes up one line
	function deleteOneLineElement(rowNum) {
		if (selRow > rowNum) selRow--;
		if (programStart > rowNum) programStart--;

		// Delete row from the code table
		codeTable.deleteRow(rowNum);
		// Also delete from the insert row
		insertTable.deleteRow(rowNum);
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

	// selectRow() selects a row with the specified rowNum
	function selectRow(rowNum) {
		if (selRow != -1) {														// if there is a selected row
			var innerTable = codeTable.rows[selRow].cells[0].children[0];		// grab the innerTable for the currently selected row
			innerTable.rows[0].cells[0].innerHTML = blank;						// make its arrow go away (it is no longer selected)
		}

		selRow = rowNum;														// make the new selected row to be rowNum
		var innerTable = codeTable.rows[selRow].cells[0].children[0];			// grab its inner table
		innerTable.rows[0].cells[0].innerHTML = arrow;							// make it have an arrow (it is now selected)
	}

	// findIndentation() returns a string with the appropriate spacing depending on the row number passed to it
	// Starting from the top of the code, it finds how many mismatching brackets '{' '}' there are when the row
	// is reached. The number of opened brackets without a matching close parenthesis is how many tabs this row
	// will need
	function findIndentation(row) {
		var bracket = 0;	// number of brackets opened
		for (var i = 0; i < codeTable.rows.length; i++) {								// iterate throughout the code table
			if (i == row) break;														// when the iteration equals the row, stop
			var innerTable = codeTable.rows[i].cells[0].children[0];					// grab the inner table for this row in the code table
			var numCells = innerTable.rows[0].cells.length;								// grab the number of cells in this inner table
			for (var j = 0; j < numCells; j++) {										// iterate throughout the cells
				if (innerTable.rows[0].cells[j].textContent.indexOf('{') >= 0) {			// if an open bracket, add one to bracket
					bracket++;
				}
				else if (innerTable.rows[0].cells[j].textContent.indexOf('}') >= 0) {		// if a close bracket, subtract one from bracket
					bracket--;
				}
			}
		}

		// the bracket variable is how many indents we need
		var indents = "";
		for (var i = 0; i < bracket; i++) indents += indent;

		return indents;
	}

	// checkValidRow() makes sure the program doesn't move somewhere that it shouldn't
	// For example, we don't want the user moving into the variable sections
	function checkValidRow(row, rowNum) {
		if (row.cells[2].innerText.indexOf("//") >= 0) return false;								// don't let the user edit a comment
		if (row.cells[2].innerText == '\xA0')  return false;											// don't let the user edit a blank line
		if (row.cells[2].innerText == 'else') return false;
		if (row.cells[2].innerText.indexOf("{") >= 0) return false;
		if (row.cells[2].innerText.indexOf("{") >= 0 && rowNum >= programStart) return false;		// don't let the user edit before a '{'
		if (rowNum < variableCount + 3) return false;												// don't let the user edit in the variable space

		// the following if statements ensure that a user doesn't edit before the program start (in the variable or function space..
		// unless its inside a function)
		if ((selRow < programStart && rowNum < programStart + 1) || (rowNum < programStart)) {
				if (row.cells[2].innerText.indexOf("{") >= 0&& selRow > rowNum) return false;
				if (row.cells[2].innerText.indexOf("function") >= 0) return false;
		}
		return true;
	}

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
					var length = codeTable.rows.length;

					// We are starting at line 3 because we do not need to check the first three line
					for (var i = 3; i < length; i++) {
									// Grab the inner table from the current row
									var innerTable = codeTable.rows[i].cells[0].children[0];
									// Get the length of the current row to check for matching string
									var colLength = innerTable.rows[0].cells.length;

									// Skip the row from where the keyWord was obtained
									if (i == lineNum) {
													continue;
									}

									// Check all the cells in the current row for matching string
									// starting at column 3 because we do not want to check the line number, arrow, and a blank column.
									for (var j = 2; j < colLength; j++) {
													// Get the text value from each cell
													cellVal = innerTable.rows[0].cells[j].textContent;
													// If found then return true
													if (cellVal === keyWord) {
																	return true;
													}
													// Do not check the row that contains a comment
													else if (cellVal === "//") {
																	continue;
													}
									}
					}
					return false;
	}

	//Weston's functions below here
    /*Weston edit start*/

    /*Weston edit end*/
    
	function typeConfirm(result) {  // For confirming types for variables and else
        if (innerTablet.rows[0].cells[clickedCellNum-5].textContent == 'var')
        {
            if (result == 'Text') {     // If they selected test before clicking okay
                clickedCell.textContent = 'TEXT';
                if (innerTablet.rows[0].cells[clickedCellNum-3].textContent != 'ID')
                {
                    tvars.push(innerTablet.rows[0].cells[clickedCellNum-3].textContent);
                }
            }
            else if (result == 'Numeric') {
                clickedCell.textContent = 'NUMERIC';
                if (innerTablet.rows[0].cells[clickedCellNum-3].textContent != 'ID')
                {
                    //console.log(innerTablet.rows[0].cells[4].textContent);
                    nvars.push(innerTablet.rows[0].cells[clickedCellNum-3].textContent);
                }
            }
            if (!foundIn(innerTablet.rows[0].cells[clickedCellNum-3].textContent, namesUsed) && innerTablet.rows[0].cells[clickedCellNum-3].textContent != 'ID') namesUsed.push(innerTablet.rows[0].cells[clickedCellNum-3].textContent);
        }
        else if (innerTablet.rows[0].cells[clickedCellNum-11].textContent == 'var')
        {
            if (result == 'Text') {     // If they selected test before clicking okay
                clickedCell.textContent = 'TEXT';
                if (innerTablet.rows[0].cells[clickedCellNum-9].textContent != 'ID')
                {
                    tvars.push(innerTablet.rows[0].cells[clickedCellNum-9].textContent);
                }
            }
            else if (result == 'Numeric') {
                clickedCell.textContent = 'NUMERIC';
                if (innerTablet.rows[0].cells[clickedCellNum-9].textContent != 'ID')
                {
                    //console.log(innerTablet.rows[0].cells[4].textContent);
                    nvars.push(innerTablet.rows[0].cells[clickedCellNum-9].textContent);
                }
            }
            if (!foundIn(innerTablet.rows[0].cells[clickedCellNum-9].textContent, namesUsed) && innerTablet.rows[0].cells[clickedCellNum-9].textContent != 'ID') namesUsed.push(innerTablet.rows[0].cells[clickedCellNum-9].textContent);
        }
        console.log("nvars: " + nvars +"\ntvars: " + tvars + "\nnamesUsed: " + namesUsed);
//        $("#selector").dialog('close');
	}
    
    function ftypeConfirm(result) {  // For confirming types for variables and else
        if (result == 'Text') {     // If they selected test before clicking okay
            clickedCell.textContent = 'TEXT';
            if (innerTablet.rows[0].cells[clickedCellNum-5].textContent != 'ID')
            {
                tFuns.push(innerTablet.rows[0].cells[clickedCellNum-5].textContent);
            }
        }
        else if (result == 'Numeric') {
            clickedCell.textContent = 'NUMERIC';
            if (innerTablet.rows[0].cells[clickedCellNum-5].textContent != 'ID')
            {
                    //console.log(innerTablet.rows[0].cells[4].textContent);
                nFuns.push(innerTablet.rows[0].cells[clickedCellNum-5].textContent);
            }
        }
        else if (result == 'Void') {
            clickedCell.textContent = 'VOID';
            if (innerTablet.rows[0].cells[clickedCellNum-5].textContent != 'ID')
            {
                //console.log(innerTablet.rows[0].cells[4].textContent);
                vFuns.push(innerTablet.rows[0].cells[clickedCellNum-5].textContent);
            }
        }
        if (!foundIn(innerTablet.rows[0].cells[clickedCellNum-5].textContent, namesUsed) && innerTablet.rows[0].cells[clickedCellNum-5].textContent != 'ID') namesUsed.push(innerTablet.rows[0].cells[clickedCellNum-5].textContent);
        console.log("nfuns: " + nFuns +"\ntfuns: " + tFuns + "\nvfuns: " + vFuns + "\nnamesUsed: " + namesUsed);
//        $("#selector").dialog('close');
	}
    
    function exprtype()
    {
        for (counter = 0; counter < innerTablet.rows[0].cells.length; counter++)
        {
            if (innerTablet.rows[0].cells[counter].textContent == '=')
            {
                if (innerTablet.rows[0].cells[counter+2].textContent == 'prompt')
                {
                    console.log(clickedCellNum + " " + counter);
                    if ((counter+4) == clickedCellNum)
                    {
                        return 'PROMPTMSG';
                    }
                    else if ((counter+6) == clickedCellNum)
                    {
                        return 'PROMPTDFLT';
                    }
                    return('PROMPT');
                }
                else if (innerTablet.rows[0].cells[counter+2].textContent == 'parseFloat')
                {
                    if ((counter+6) == clickedCellNum)
                        return 'PROMPTMSG';
                    else if ((counter+8) == clickedCellNum)
                        return 'PARSEDFLT';
                    else return 0;
                }
                else
                {
                    if (foundIn(innerTablet.rows[0].cells[counter-2].textContent,nvars)) return 'NUMERIC ASSIGNMENT';
                    else if (foundIn(innerTablet.rows[0].cells[counter-2].textContent,tvars)) return 'TEXT ASSIGNMENT';
                    else return 0;
                }
            }
            else if (foundIn(innerTablet.rows[0].cells[counter].textContent, compKeys))
            {
                if (innerTablet.rows[0].cells[counter+2].textContent == '(' && innerTablet.rows[0].cells[counter+4].textContent == ')')
                {
                    return('BOOL');
                }
                else
                {
                    console.log('not bool');
                    if (foundIn(innerTablet.rows[0].cells[counter+3].textContent,nvars))
                    {
                        return ('NUMERIC COMPARISON');
                    }
                    else return 0;
                }
            }
            else if (innerTablet.rows[0].cells[counter].textContent == "document.write" || innerTablet.rows[0].cells[counter].textContent == "document.writeln")
            {
                return ('PRINT');
            }
            else if (innerTablet.rows[0].cells[counter].textContent == "return")
            {
                return ('RETURN');
            }
            console.log(innerTablet.rows[0].cells[counter].textContent);
        }
		
		returnToNormalColor();
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
		clickedCell.textContent = result;
        console.log("The result is " + result);
		namesUsed.push(result);

		var lastCellindex = innerTablet.rows[0].cells.length-1;
        innerTablet.rows[0].cells[lastCellindex-1].textContent
		if (innerTablet.rows[0].cells[lastCellindex-1].textContent == 'NUMERIC') nvars.push(result);
		else if (innerTablet.rows[0].cells[lastCellindex-1].textContent == 'TEXT') tvars.push(result);
		//$("#nameDialog").dialog('close');
        console.log("nvars: " + nvars +"\ntvars: " + tvars + "\nnamesUsed: " + namesUsed);
//		$("#selector").dialog('close');
		
		returnToNormalColor();
	}

	function idConfirm(result) {
        if (foundIn(result, namesUsed))
        {
            console.log("id value: " + result);
            clickedCell.textContent = result;
            console.log("\n" + result);
            namesRef.push(result);
            console.log(namesRef);
        }
//		$("#selector").dialog('close');
		
		returnToNormalColor();
	}

//	function selectorCancel() {
//		$("#selector").dialog('close');
//
//	}
    
    function tConstantconfirm(result)
    {
//        $("#selector").dialog('close');
        clickedCell.textContent = '"' + result + '"';
		
		returnToNormalColor();
    }
    
    function exprSelConfirm(result)
    {
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
                clickedCell.textContent = "EXPR";
                for (var i = 0; i < values.length; i++) {			// for all cells in the table
                    cell = innerTablet.rows[0].insertCell(++clickedCellNum);	// insert a cell at startInd
                    cell.innerHTML = values[i];						// make the innerHTML of the cell cells[i]
                }
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
		
		returnToNormalColor();
    }
    
    function mathExpr(result)
    {
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
        clickedCell.textContent = values[0];
        for (i = 1; i < values.length; i++)
        {
            cell = innerTablet.rows[0].insertCell(++clickedCellNum);
            cell.innerHTML = values[i];
        }
            
         returnToNormalColor();                 
    }
    
    function boolConfirm(result)
    {
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
        clickedCell.textContent = "ID";
        for (var i = 0; i < values.length; i++) {			// for all cells in the table
            cell = innerTablet.rows[0].insertCell(++clickedCellNum);	// insert a cell at startInd
            cell.innerHTML = values[i];						// make the innerHTML of the cell cells[i]
        }
		
		returnToNormalColor();
    }

	// Weston's functions
    /*Weston edit start*/
    function funCallfinal(result)
    {
        clickedCell.textContent = result;
        namesRef.push(result);
        $("#selector").dialog('close');
    }
    /*Weston edit end*/
    
    function funConfirm(result)
    {
        if (foundIn(result, namesUsed))
        {
            console.log("id value: " + result);
            clickedCell.textContent = result + "()";
            console.log("\n" + result);
            namesRef.push(result);
            console.log(namesRef);
        }
		$("#selector").dialog('close');
    }
    
	function generateSelectionHTML(list, kind)
	{
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
    
    function exprConfirm(result)
    {
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

	function delN(name,list)
	{
		for (i = 0; i < list.length; i++)
		{
			if (list[i].toUpperCase() == name.toUpperCase())
			{
				list.splice(i,1);
				break;
			}
		}
	}

	function foundIn(name,list)
	{
		for (i = 0; i < list.length; i++)
		{
			//console.log(list[i].toUpperCase() + " " + name.toUpperCase());
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
		var innerTable;
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
		
		for (var i = 0; i < codeTable.rows.length; i++) {
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
		
			innerTable = codeTable.rows[i].cells[0].children[0];
			numCells = innerTable.rows[0].cells.length;
			if (numCells == 2) { continue; }
			cellText = innerTable.rows[0].cells[2].textContent;
			
			if (numCells == 3) {
				if (cellText.indexOf("}") < 0 && cellText.indexOf("{") < 0 && cellText.indexOf("else") < 0) { rowType.push("blankLine"); continue; }
				else bracketFlag = true;
			}
			
			if (cellText.indexOf("function") >= 0) rowType.push("functionDeclaration");
			else if(cellText.indexOf("if") >= 0) rowType.push("if");
			else if(cellText.indexOf("else") >= 0) rowType.push("else");
			else if(cellText.indexOf("while") >= 0) rowType.push("while");
			else if(cellText.indexOf("return") >= 0) rowType.push("return");
			else if(cellText.indexOf("for") >= 0) rowType.push("for");
			else if(cellText.indexOf("//") >= 0) rowType.push("comment");
			else if(cellText.indexOf("writeln") >= 0) rowType.push("writeln");
			else if(cellText.indexOf("write") >= 0) rowType.push("write");
			else if(cellText.indexOf("var") >= 0) rowType.push("variable");
			else if(cellText.indexOf("{") >= 0) rowType.push("closeBracket");
			else if(cellText.indexOf("}") >= 0) rowType.push("openBracket");
			else if(innerTable.rows[0].cells[7].textContent.indexOf("parse") >= 0) rowType.push("numericPrompt");
			else if(innerTable.rows[0].cells[7].textContent.indexOf("prompt") >= 0) rowType.push("prompt");
			else if(innerTable.rows[0].cells[3].textContent.indexOf("=") >= 0) rowType.push("assignment");
			else { rowType.push("functionCall"); funcCall = true; }
			
			for (var j = 2; j < numCells; j++) {
				cellText = innerTable.rows[0].cells[j].textContent;
				if (cellText.indexOf("//") >= 0) break;
				if (cellText.indexOf("document.writeln") >= 0) {
					if (firstChar == false) { firstChar = true; charCountStart.push(charCount + 1); lineNums.push(i); }
					if (!firstLine) firstLine = true;
					codeStr += "document1writeln";
					charCount += 16;
				}
				else if (cellText.indexOf("document.write") >= 0) {
					if (firstChar == false) { firstChar = true; charCountStart.push(charCount + 1); lineNums.push(i); }
					if (!firstLine) firstLine = true;
					codeStr += "document1write";
					charCount += 14;
				}
				else {
					if (cellText.indexOf(";") >= 0) {
						semi = cellText.indexOf(";");
						for (var k = 0; k < semi + 1; k++) tempText += cellText.charAt(k);
						cellText = tempText;
						firstLine = true;
					}
					
					codeStr += cellText;
					if (firstChar == false && bracketFlag == false) { firstChar = true; charCountStart.push(charCount + 1); lineNums.push(i); }
					if (!firstLine) firstLine = true;
					charCount += cellText.length;
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
		selRow = rowNum;
		
		codeStr = codeStr.replace("\xA0", " ");
		codeStr = codeStr.replace("\x1E", " ");
		var tCodeStr = "";
		for (var i = 0; i < codeStr.length; i++) {
			if (codeStr[i] != "\xA0") tCodeStr += codeStr[i];
			else tCodeStr += " ";
		}
		codeStrLen = tCodeStr.length;
		
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
					return [true, selRow];
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
		var innerTable;
		
		for (var i = 0; i < codeTable.rows.length; i++) {
			innerTable = codeTable.rows[i].cells[0].children[0];
			innerTable.rows[0].cells[1].innerHTML = blank;
		}	
		
		innerTable = codeTable.rows[row].cells[0].children[0];
		innerTable.rows[0].cells[1].innerHTML = arrow;
		returnToNormalColor();
		highlightCurrentStep(row);
		selRow = rowNum;
	}

	function reset() {
		selectLine(codeTable.rows.length - 1);
		rowNum = lineNums[0];
		selRow = rowNum;
	}

	function getDatatypeSelectedLine() {
		var innerTable = codeTable.rows[selRow].cells[0].children[0];
		var numCells = innerTable.rows[0].cells.length;
		if (innerTable.rows[0].cells[numCells - 1].textContent.indexOf("NUMERIC") >= 0) return "numeric";
		else if (innerTable.rows[0].cells[numCells - 1].textContent.indexOf("NUMERIC") >= 0) return "text";
		
		return null;
	}
    function addNewInsertRow() {
        var row = insertTable.insertRow(-1);
        var cell = row.insertCell(0);
        cell.className = "insert";
        cell.innerHTML = blank;
    }
    
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
        clickedCell.textContent = result;
    }
    
    function fChoose(result) {
        //Function that is called when selecting a function that replaces the text of a single cell
        clickedCell.textContent = result;
    }
    
    function enterNum(result) {
        //Function called to replace a cell with a number
        clickedCell.textContent = result;
    }
    
    function fIDconfirm(result) {
        //Function called to assign an identifier to a function at its declaration
        if (foundIn(result, resWords)) return;
        clickedCell.textContent = result;
        switch (innerTablet.rows[0].cells[clickedCellNum+5].textContent)
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
				
				function createAlertBox(title, instruction, bool, callback) {
						var alert = new Alert();
						alert.open(title, instruction, bool, callback);
				}
}