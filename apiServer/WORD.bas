Attribute VB_Name = "WORD"
Global word As Object
Global Const COMMAND_CODE_OK = "OK"
Const UNKNOWN_COMMAND = "UNKNOWN_COMMAND"
Const COMMAND_CODE_USER_ERROR = "USER_ERROR"
Const WORD_IS_CLOSED = "WORD_IS_CLOSED"
Const IDX_CODE = 0
Const IDX_DATA = 1

Sub wordStart()
    Set word = CreateObject("word.application")
    word.Visible = True
End Sub

Function wordClose() As String
    If word Is Nothing Then
        wordClose = WORD_IS_CLOSED
    Else
        word.Quit
        Set word = Nothing
        wordClose = OK
    End If
End Function

Sub docClose()
    word.ActiveDocument.Close SaveChanges:=False
End Sub

Function docOpen(path As String) As String
    If word Is Nothing Then
        docOpen = WORD_IS_CLOSED
    Else
        word.Documents.Open fileName:=path
        docOpen = OK
    End If
End Function

Sub docFind(text As String)
    With word.Selection.Find
     .Forward = True
     .ClearFormatting
     .MatchWholeWord = True
     .MatchCase = False
     .Wrap = wdFindContinue
     .Execute FindText:=text
    End With
End Sub

Sub docReplaceSelection(text As String)
    word.Options.ReplaceSelection = True
    With word.Selection
        .TypeText text:=text
    End With
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

    'args = getArgs
    
    For ArgCount = LBound(args) To UBound(args)
        sMsg = sMsg & args(ArgCount) & vbNewLine
    Next ArgCount
    
    MsgBox "The arguments are:" & vbNewLine & vbNewLine & sMsg

End Sub

Function execCommand(command As String) As String()
    Dim commandAr() As String
    Dim returnVal(0 To 1) As String
    Dim code As String
    
    If LCase(command) = "wordstart" Then
        wordStart
        returnVal(IDX_CODE) = COMMAND_CODE_OK
        execCommand = returnVal
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

    commandAr = Split(command)
    If commandAr(0) = "docOpen" Then
        Dim docName As String
        docName = commandAr(1)
        docName = Replace(docName, """", "")
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
