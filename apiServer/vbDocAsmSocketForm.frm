VERSION 5.00
Begin VB.Form vbDocAsmSocketForm 
   Caption         =   "vbDocAsmSocket"
   ClientHeight    =   3195
   ClientLeft      =   60
   ClientTop       =   345
   ClientWidth     =   4680
   LinkTopic       =   "Form1"
   ScaleHeight     =   3195
   ScaleWidth      =   4680
   StartUpPosition =   3  'Windows Default
   Begin VB.CommandButton CMD 
      Caption         =   "CMD"
      Height          =   855
      Left            =   2160
      TabIndex        =   2
      Top             =   1440
      Width           =   1455
   End
   Begin VB.Timer appTimer 
      Interval        =   500
      Left            =   2520
      Top             =   480
   End
   Begin VB.CommandButton btScanDir 
      Caption         =   "Scan dir"
      Height          =   855
      Left            =   120
      TabIndex        =   1
      Top             =   120
      Width           =   1455
   End
   Begin VB.CommandButton btExit 
      Caption         =   "Exit"
      Height          =   735
      Left            =   120
      TabIndex        =   0
      Top             =   2040
      Width           =   1455
   End
End
Attribute VB_Name = "vbDocAsmSocketForm"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
Private Sub appTimer_Timer()
    processFirstRequest
End Sub

Private Sub btExit_Click()
    Unload vbDocAsmSocketForm
    
End Sub

Private Sub btScanDir_Click()
    Dim fs
    Set fs = CreateObject("Scripting.FileSystemObject")

    Set f = fs.GetFolder(App.path & "\request")
    
    Set fc = f.Files
    Dim filesCount As Integer
    filesCount = 0
    For Each f1 In fc
    '    s = s & f1.Name
    '    s = s & vbCrLf
        filesCount = filesCount + 1
    Next
    
    MsgBox getFlagFilesCount
End Sub

Private Sub CMD_Click()
    Dim ar() As String
    Dim arlen As Integer
    
    Dim CMD As String, param1 As String
    
    
    ar = Split("docOpen d:\www\doc1.doc")
    arlen = UBound(ar) + 1
    CMD = ar(0)
    param1 = ar(1)
    
End Sub

'Sub ShowFolderInfo(folderspec)
'    Dim fs, f, s
'    Set fs = CreateObject("Scripting.FileSystemObject")
'    Set f = fs.GetFolder(folderspec)
'    s = f.DateCreated
'    MsgBox s
'End Sub


Private Sub Form_Load()
    'processFirstRequest
    'Unload vbDocAsmSocketForm
    
    
    
    'wordStart
    'docOpen path:="d:/www/docs/doc-act.doc"
'    replaceFirstWithText "@num;", "aaa"
    
    'replaceAllWithText "@num;", "aaa"
    'docFind "@num;"
    'docReplaceSelection "26"
    
    
    'Dim commandAr
    'Dim command As String
    
    'command = "replaceFirstWithText ""@date"" ""26 apr 2012"""
    'commandAr = parseCommandString(command)
    'MsgBox commandAr(0)
    'MsgBox commandAr(1)
    'MsgBox commandAr(2)
    
    
End Sub

