Attribute VB_Name = "FL"
Global Const SYS_FL_FOR_READING = 1, _
      SYS_FL_FOR_WRITING = 2, _
      SYS_FL_FOR_APPENDING = 8

Global Const SYS_FL_TEXT_FORMAT_DEFAULT = -2, _
      SYS_FL_TEXT_FORMAT_UNICODE = -1, _
      SYS_FL_TEXT_FORMAT_ASCII = 0


'================================================================
Function SYS_FL_open(fileName, mode)
'================================================================

   Dim fileSystem
   Set fileSystem = CreateObject("Scripting.FileSystemObject")

   Set SYS_FL_open = fileSystem.OpenTextFile(fileName, mode, SYS_FL_TEXT_FORMAT_ASCII)
End Function

'================================================================
Function SYS_FL_exist(fName)
'================================================================
'возвращает true, если файл с DOS-именем (fName) существует

   Dim fso
   Set fso = CreateObject("Scripting.FileSystemObject")

   SYS_FL_exist = fso.FileExists(fName)
End Function

'================================================================
Function SYS_FL_create(fileName, mode)
'================================================================

   Dim fileSystem
   Set fileSystem = CreateObject("Scripting.FileSystemObject")

   Set SYS_FL_create = fileSystem.CreateTextFile(fileName, True, SYS_FL_TEXT_FORMAT_ASCII)
End Function

'================================================================
Function SYS_FL_delete(fileName)
'================================================================
'удаляет файл с названием (fileName)

   Dim fileSystem
   Set fileSystem = CreateObject("Scripting.FileSystemObject")

   Dim found
   found = fileSystem.FileExists(fileName)
   
   'Response.Write "deleteFile: fileName=" & fileName & "<BR>"
   If (found) Then
      On Error Resume Next
      Err.Clear
      fileSystem.deleteFile fileName
      If (Err <> 0) Then
         Err.Clear
         'UI_wr "SYS_FL_delete : ошибка удаления файла '" & fileName & "'<BR>"
         SYS_FL_delete = False
         Exit Function
      End If
   End If

   SYS_FL_delete = True
End Function



