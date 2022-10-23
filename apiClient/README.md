# CLI to create a document

## start Word
```
./asm.sh wordStart
```
possible responses:
```
{"status":"OK","body":""}
{"status":"USER_ERROR","body":"WORD_IS_ALREADY_STARTED"}
```


## open document
```
./asm.sh docOpen "d:/www/doc1.doc"
```
possible responses:
```
{"status":"OK","body":""}
{"status":"USER_ERROR","body":"WORD_IS_CLOSED"}
{"status":"USER_ERROR","body":"FILE_NOT_FOUND"}
```


## close active document without saving
```
./asm.sh docClose
```
possible responses:
```
{"status":"OK","body":""}
{"status":"USER_ERROR","body":"WORD_IS_CLOSED"}
{"status":"USER_ERROR","body":"NO_OPENED_DOCUMENTS"}
```



## close Word
```
./asm.sh wordClose
```
possible responses:
```
{"status":"OK","body":""}
{"status":"USER_ERROR","body":"WORD_IS_CLOSED"}
```

