Attribute VB_Name = "WORD"
Global word As Object
Global Const COMMAND_CODE_OK = "OK"
Const COMMAND_CODE_UNKNOWN_COMMAND = "UNKNOWN_COMMAND"

Sub wordStart()
    Set word = CreateObject("word.application")
    word.Visible = True
End Sub

Sub wordClose()
    If word Is Nothing Then
    Else
        word.Quit
        Set word = Nothing
    End If
End Sub

Sub docClose()
    word.ActiveDocument.Close SaveChanges:=False
End Sub

Sub docOpen(path As String)
    word.Documents.Open fileName:=path
End Sub

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
    
    If LCase(command) = "wordstart" Then
        wordStart
        returnVal(0) = COMMAND_CODE_OK
        execCommand = returnVal
        Exit Function
    End If
    
    If LCase(command) = "wordclose" Then
        wordClose
        returnVal(0) = COMMAND_CODE_OK
        execCommand = returnVal
        Exit Function
    End If

    commandAr = Split(command)
    If commandAr(0) = "docOpen" Then
        Dim docName As String
        docName = commandAr(1)
        docName = Replace(docName, """", "")
        docOpen docName
        returnVal(0) = COMMAND_CODE_OK
        execCommand = returnVal
        Exit Function
    End If
    
    returnVal(0) = COMMAND_CODE_UNKNOWN_COMMAND
    execCommand = returnVal
    
End Function
