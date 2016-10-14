/**
 * Created by matthewmueller on 9/22/16.
 */
'use strict';


angular


    .module('upload', ['angularFileUpload'])


    .controller('UploadController', ['$scope', '$http', 'FileUploader', function($scope, $http, FileUploader) {
        var uploader = $scope.uploader = new FileUploader();

        // CALLBACKS

        uploader.onAfterAddingFile = function(fileItem) {
            $scope.processing = true;
            $scope.file = [ uploader.queue[uploader.queue.length-1] ];

            var data = new FormData();
            data.append('file', fileItem._file);
            data.append('file_format', fileItem.file.type);

            $http.post('http://localhost:8080/convert',data, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            }).then(function(response){
                $scope.processing = false;

                console.info(response);

                if (response && response.data.length > 0) {
                    $scope.inchiCode = response.data[0].inchiCode ? response.data[0].inchiCode.split("InChI=")[1] : "not found";
                    $scope.inchiKey = response.data[0].inchiKey || "not found";

                    $scope.MOLdata = response.data[0].outputLog.split("M  END")[0];
                    sketcher.loadMolecule(ChemDoodle.readMOL($scope.MOLdata));
                } else {
                    console.info('Your file wasn\'t processed properly. Make sure the name contains no special characters.');
                    $scope.inchiCode = "ERROR: bad input";
                    $scope.inchiKey = "ERROR: bad input";

                    sketcher.clear();
                }
            });
        };
    }]);