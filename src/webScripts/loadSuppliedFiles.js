// loadSuppliedFiles
response.writeJSON({
  compilationFiles: [ {
    title: 'Foo',
    filename: 'foo.c',
    size: 1024,
    overwrite: true
  } ],

  fileSystemFiles: [ {
    title: 'Foo Stuff',
    filename: 'foo.txt',
    size: 1024,
    readable: true,
    writable: true,
    overwrite: true
  } ]
});
