/**
 * Created by matthewmueller on 9/22/16.
 */
'use strict';


angular
    .module('upload', [ 'angularFileUpload' ])
    .controller('UploadController', ['$scope', '$http', 'FileUploader', function($scope, $http, FileUploader) {
        $scope.models = [{ 'molFile':'',
            'inchiCode':'none',
            'inchiKey':'none'
        }];

        var uploader = $scope.uploader = new FileUploader();

        // CALLBACKS

        uploader.onAfterAddingFile = function(fileItem) {
            $scope.processing = true;
            $scope.file = [ uploader.queue[uploader.queue.length-1] ];

            var data = new FormData();
            data.append('file', fileItem._file);
            data.append('file_format', fileItem.file.type);

            $http.post('http://localhost:8080/convert', data, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            }).then(function(response){
                $scope.processing = false;
                $scope.models = [];

                console.info(response);

                if (response && response.data.length > 0) {
                    response.data.forEach(function(compound, index){
                        $scope.models[index] = { 'molFile':compound.outputLog.split('$$$$\n')[index],
                            'inchiCode':compound.inchiCode ? compound.inchiCode.split('InChI=')[1] : 'not found',
                            'inchiKey':compound.inchiKey || 'not found'
                        };
                    });
                } else {
                    $scope.models = [{ 'molFile':'',
                        'inchiCode':'ERROR: bad response',
                        'inchiKey':'ERROR: bad response'
                    }];
                }
            });
        };
    }]);