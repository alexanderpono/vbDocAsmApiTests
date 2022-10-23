Attribute VB_Name = "API_IO"
Function getFlagFilesCount() As Integer
    Dim fs
    Set fs = CreateObject("Scripting.FileSystemObject")
    Set f = fs.GetFolder(App.path & "\request")

    Set fc = f.Files
    Dim filesCount As Integer
    filesCount = 0
    For Each f1 In fc
        filesCount = filesCount + 1
    Next

    getFlagFilesCount = filesCount
End Function

Function getFirstFlagFileName() As String
    Dim fs
    Set fs = CreateObject("Scripting.FileSystemObject")
    Set f = fs.GetFolder(App.path & "\request")

    Set fc = f.Files
    Dim filesCount As Integer
    filesCount = 0
    For Each f1 In fc
        getFirstFlagFileName = f1.Name
        Exit Function
        'filesCount = filesCount + 1
    Next

    'getFlagFilesCount = filesCount
End Function

Function getRequestBody(requestId As String) As String
    Dim inFileName As String
    inFileName = App.path & "\request-body\" & requestId
    
    Set inFile = SYS_FL_open(inFileName, SYS_FL_FOR_READING)
    
    getRequestBody = inFile.ReadAll
    inFile.Close
End Function

Sub writeResponseBody(requestId As String, body As String)
    Dim fName As String
    fName = App.path & "\response-body\" & requestId

    Set outFile = SYS_FL_create(fName, SYS_FL_FOR_WRITING)
    outFile.Write body
    outFile.Close
End Sub

Sub writeResponseFlag(requestId As String, body As String)
    Dim fName As String
    fName = App.path & "\response\" & requestId

    Set outFile = SYS_FL_create(fName, SYS_FL_FOR_WRITING)
    outFile.Write body
    outFile.Close
End Sub

Sub deleteRequestFlag(requestId As String)
    Dim fName As String
    fName = App.path & "\request\" & requestId
    
    SYS_FL_delete (fName)
End Sub

Sub deleteRequestBody(requestId As String)
    Dim fName As String
    fName = App.path & "\request-body\" & requestId
    
    SYS_FL_delete (fName)
End Sub

Sub processRequest(requestId As String)
    Dim requestBody As String
    Dim responseBody As String
    Dim responseCode As String
    Dim responseBodyAr() As String
    Dim log As String
    

    requestBody = getRequestBody(requestId)
    
    writeLog ("REQUEST request-id: " & requestId & " request-body:" & requestBody)
    'MsgBox "requestBody=" & requestBody
    responseBodyAr = Split(requestBody, vbCr)
    
    Dim i As Integer
    Dim command As String
    Dim commandi As Variant
    Dim commandAr() As String
    Dim commandResult() As String
    For Each commandi In responseBodyAr
        command = Trim(commandi)
        command = Replace(command, vbLf, "")
        If (Len(command) <> 0) Then
            writeLog ("EXEC " & command)
            
            commandAr = Split(command)
            commandResult = execCommand(command)
            writeLog ("commandResult(0)=" & commandResult(0))
            If commandResult(0) <> COMMAND_CODE_OK Then
                Exit For
            End If
        End If
    Next
       
    If commandResult(0) = COMMAND_CODE_OK Then
        responseBody = commandResult(1)
        responseCode = commandResult(0)
    Else
        responseBody = commandResult(1)
        responseCode = commandResult(0)
    End If
    
    writeResponseBody requestId, responseBody
    writeResponseFlag requestId, responseCode
        
    log = "ANSWER request-id: " & requestId & " response-code: " & responseCode & " response-body:" & responseBody
    writeLog (log)
        
    deleteRequestFlag requestId
    deleteRequestBody requestId
End Sub

Sub writeLog(msg As String)
    Dim fName As String
    fName = App.path & "\server.log"
    
    If (SYS_FL_exist(fName)) Then
        Set f = SYS_FL_open(fName, SYS_FL_FOR_APPENDING)
    Else
        Set f = SYS_FL_create(fName, SYS_FL_FOR_APPENDING)
    End If
    
    f.WriteLine msg
    f.Close
End Sub

Sub processFirstRequest()
    Dim flagFilesCount As Integer
    Dim requestId As String
    
    flagFilesCount = getFlagFilesCount
    
    If (flagFilesCount > 0) Then
        requestId = getFirstFlagFileName
        processRequest requestId
    End If
End Sub
