Attribute VB_Name = "WORD"
Global word As Object
Global Const COMMAND_CODE_OK = "OK"
Const UNKNOWN_COMMAND = "UNKNOWN_COMMAND"
Const COMMAND_CODE_USER_ERROR = "USER_ERROR"
Const WORD_IS_CLOSED = "WORD_IS_CLOSED"
Const FILE_NOT_FOUND = "FILE_NOT_FOUND"
Const NO_OPENED_DOCUMENTS = "NO_OPENED_DOCUMENTS"
Const WORD_IS_ALREADY_STARTED = "WORD_IS_ALREADY_STARTED"
Const IDX_CODE = 0
Const IDX_DATA = 1

Function wordStart()
    If word Is Nothing Then
        Set word = CreateObject("word.application")
        word.Visible = True
        wordStart = OK
    Else
        wordStart = WORD_IS_ALREADY_STARTED
    End If
End Function

Function wordClose() As String
    If word Is Nothing Then
        wordClose = WORD_IS_CLOSED
    Else
        word.Quit
        Set word = Nothing
        wordClose = OK
    End If
End Function

Function docClose()
    If word Is Nothing Then
        docClose = WORD_IS_CLOSED
    Else
        If word.documents.Count >= 1 Then
            word.ActiveDocument.Close SaveChanges:=False
            docClose = OK
        Else
            docClose = NO_OPENED_DOCUMENTS
        End If
    End If
End Function

Function docOpen(path As String) As String
    If (SYS_FL_exist(path)) Then
        If word Is Nothing Then
            docOpen = WORD_IS_CLOSED
        Else
            word.documents.Open fileName:=path
            docOpen = OK
        End If
    Else
        docOpen = FILE_NOT_FOUND
    End If


End Function

Sub docSelectAll()
    word.Selection.WholeStory
End Sub

Sub docCopyToBuffer()
    word.Selection.Copy
End Sub

Function copyAllToBuffer() As String
    If word Is Nothing Then
        copyAllToBuffer = WORD_IS_CLOSED
    Else
        If word.documents.Count = 0 Then
            copyAllToBuffer = NO_OPENED_DOCUMENTS
        Else
            docSelectAll
            docCopyToBuffer
            copyAllToBuffer = OK
        End If
    End If
End Function


Sub docFind(text)
    With word.Selection.Find
     .Forward = True
     .ClearFormatting
     .MatchWholeWord = True
     .MatchCase = False
     .Wrap = wdFindContinue
     .Execute FindText:=text
    End With
End Sub

Sub docReplaceSelection(text)
    word.Options.ReplaceSelection = True
    With word.Selection
        .TypeText text:=text
    End With
End Sub

Sub replaceFirstWithText(search, replaceS)
    'With word.Selection.Find
    '.text = search
    '    .Replacement.text = replaceS
    '    .Execute FindText = search
    'End With
    'MsgBox search
    docFind search
    docReplaceSelection replaceS
    
End Sub

Function getArgs()
    Dim cmdLine As String
    Dim args As Variant
    
    cmdLine = "D:\www\vbDocAsm\commands.txt 2"
    args = Split(Mid(cmdLine, 1, 255), " ")
    
    getArgs = args
End Function

Sub printArgs(args As Variant)
    Dim ArgCount As Integer
    Dim sMsg As String

    For ArgCount = LBound(args) To UBound(args)
        sMsg = sMsg & args(ArgCount) & vbNewLine
    Next ArgCount
    
    MsgBox "The arguments are:" & vbNewLine & vbNewLine & sMsg

End Sub

Function quote(value As String) As String
    quote = """" & value & """"
End Function

Function getStateWordIsStarted()
    Dim value As String
    
    If word Is Nothing Then
        value = "false"
    Else
        value = "true"
    End If
    
    getStateWordIsStarted = quote("wordIsStarted") & ": " & quote(value)
End Function

Function getStateDocuments()
    Dim value As String
    Dim isFirst As Boolean
    
    isFirst = True
    
    If word Is Nothing Then
        value = ""
    Else
        For Each objDocument In word.documents
            If Not isFirst Then
                value = value & ","
            End If
            
            value = value & quote(objDocument.Name)
            isFirst = False
        Next objDocument
    End If
    
    getStateDocuments = quote("documents") & ":[" & value & "]"
    
End Function

Function getState()
    Dim result As String
    Dim wordIsStarted As String
    Dim documents As String
    
    Dim objDocument
    Dim strMsg As String
    
    result = result & """wordIsStarted"": "
    If word Is Nothing Then
        result = result & """false"""
    Else
        result = result & """true"""
        
        For Each objDocument In word.documents
            strMsg = strMsg & objDocument.Name & ","
        Next objDocument
        result = result & ", ""documents"":[" & strMsg & """""]"
        
    End If
    
    getState = "{" & getStateWordIsStarted() & ", " & getStateDocuments() & "}"
End Function

Function getParamsArray0(cmdString As String)
    Dim rawAr
    Dim paramsAr() As String
    rawAr = Split(cmdString)
    
    Dim paramsArraysLen As Integer
    Dim paramsArrays(50)
    Dim curParamArray(50) As String
    Dim i, j As Integer
    Dim token As String
    Dim firstChar, lastChar As String
    Dim paramsArCount, curParamArrayCount As Integer
    paramsArCount = 0
    curParamArrayCount = 0
    
    
    
    For i = 0 To UBound(rawAr)
        token = rawAr(i)
        firstChar = Mid(token, 1, 1)
        lastChar = Mid(token, Len(token), 1)
        
        If (curParamArrayCount = 0 And firstChar <> """" And lastChar <> """") Then
            ReDim Preserve paramsAr(paramsArCount)
            paramsAr(paramsArCount) = token
            paramsArCount = paramsArCount + 1
            GoTo ContinueLoop
        End If
        
        If (curParamArrayCount And firstChar = """" And lastChar = """") Then
            ReDim Preserve paramsAr(paramsArCount)
            paramsAr(paramsArCount) = token
            paramsArCount = paramsArCount + 1
            GoTo ContinueLoop
        End If
        
        If (lastChar <> """") Then
            curParamArray(curParamArrayCount) = token
            curParamArrayCount = curParamArrayCount + 1
            GoTo ContinueLoop
        End If
        
        curParamArray(curParamArrayCount) = token
        curParamArrayCount = curParamArrayCount + 1
        Dim s As String
        s = ""
        For j = 0 To curParamArrayCount - 1
            If (j > 0) Then
                s = s & " "
            End If
            s = s & curParamArray(j)
        Next j
        ReDim Preserve paramsAr(paramsArCount)
        paramsAr(paramsArCount) = s
        paramsArCount = paramsArCount + 1
        curParamArrayCount = 0
        
ContinueLoop:
        
    Next i
    
    getParamsArray0 = paramsAr
End Function

Function deleteQuots(ar0() As String)
    Dim ar1() As String
    Dim token As String
    
    For i = 0 To UBound(ar0)
        token = ar0(i)
        
        firstChar = Mid(token, 1, 1)
        lastChar = Mid(token, Len(token), 1)
        
        If (firstChar = """" And lastChar = """") Then
            token = Mid(token, 2, Len(token) - 2)
        End If
        
        ReDim Preserve ar1(i)
        ar1(i) = token
    Next i
    deleteQuots = ar1
End Function

Function parseCommandString(cmdString As String)
    Dim ar0() As String
    Dim ar1() As String
    Dim i As Integer
    
    ar0 = getParamsArray0(cmdString)
    ar1 = deleteQuots(ar0)

    parseCommandString = ar1

End Function

Function pasteToEnd() As String
    If word Is Nothing Then
        pasteToEnd = WORD_IS_CLOSED
    Else
        If word.documents.Count = 0 Then
            pasteToEnd = NO_OPENED_DOCUMENTS
        Else
            docGotoEnd
            docPaste
            pasteToEnd = OK
        End If
    End If
End Function

Sub docGotoEnd()
    word.Selection.EndKey (6)
End Sub

Sub docPaste()
    word.Selection.Paste
End Sub


Function execCommand(command As String) As String()
    Dim commandAr() As String
    Dim returnVal(0 To 1) As String
    Dim code As String
    
    If LCase(command) = "wordstart" Then
        code = wordStart
        If code = OK Then
            returnVal(IDX_CODE) = COMMAND_CODE_OK
            execCommand = returnVal
        Else
            returnVal(IDX_CODE) = COMMAND_CODE_USER_ERROR
            returnVal(IDX_DATA) = code
            execCommand = returnVal
        End If
        Exit Function
    End If
    
    If LCase(command) = "wordclose" Then
        code = wordClose
        If code = OK Then
            returnVal(IDX_CODE) = COMMAND_CODE_OK
            execCommand = returnVal
        Else
            returnVal(IDX_CODE) = COMMAND_CODE_USER_ERROR
            returnVal(IDX_DATA) = code
            execCommand = returnVal
        End If
        Exit Function
    End If

    If LCase(command) = "docclose" Then
        code = docClose
        If code = OK Then
            returnVal(IDX_CODE) = COMMAND_CODE_OK
            execCommand = returnVal
        Else
            returnVal(IDX_CODE) = COMMAND_CODE_USER_ERROR
            returnVal(IDX_DATA) = code
            execCommand = returnVal
        End If
        Exit Function
    End If

    If LCase(command) = "getstate" Then
        code = getState
        returnVal(IDX_CODE) = COMMAND_CODE_OK
        returnVal(IDX_DATA) = code
        execCommand = returnVal
        Exit Function
    End If
    
    If LCase(command) = "copyalltobuffer" Then
        code = copyAllToBuffer
        If code = OK Then
            returnVal(IDX_CODE) = COMMAND_CODE_OK
            execCommand = returnVal
        Else
            returnVal(IDX_CODE) = COMMAND_CODE_USER_ERROR
            returnVal(IDX_DATA) = code
            execCommand = returnVal
        End If
        Exit Function
    End If
    
    If LCase(command) = "pastetoend" Then
        code = pasteToEnd
        If code = OK Then
            returnVal(IDX_CODE) = COMMAND_CODE_OK
            execCommand = returnVal
        Else
            returnVal(IDX_CODE) = COMMAND_CODE_USER_ERROR
            returnVal(IDX_DATA) = code
            execCommand = returnVal
        End If
        Exit Function
    End If
    

       
    commandAr = parseCommandString(command)
    If commandAr(0) = "replaceFirstWithText" Then
        Dim search, replaceS As String
        search = replace(commandAr(1), """", "")
        replaceS = replace(commandAr(2), """", "")
        
        replaceFirstWithText search, replaceS
        returnVal(0) = COMMAND_CODE_OK
        returnVal(1) = ""
        execCommand = returnVal
        Exit Function
    End If
    
    If commandAr(0) = "docOpen" Then
        Dim docName As String
        docName = commandAr(1)
        docName = replace(docName, """", "")
        code = docOpen(docName)
        If (code = OK) Then
            returnVal(0) = COMMAND_CODE_OK
            execCommand = returnVal
        Else
            returnVal(IDX_CODE) = COMMAND_CODE_USER_ERROR
            returnVal(IDX_DATA) = code
            execCommand = returnVal
        End If
        Exit Function
    End If
    
    returnVal(0) = COMMAND_CODE_USER_ERROR
    returnVal(1) = UNKNOWN_COMMAND
    execCommand = returnVal
    
End Function
