module.exports = {
  name: 'ui-components-visuals',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/ui-components/visuals',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
