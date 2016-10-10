/**
 * Created by matthewmueller on 9/22/16.
 */
'use strict';


angular


    .module('upload', ['angularFileUpload'])


    .controller('UploadController', ['$scope', '$http', 'FileUploader', function($scope, $http, FileUploader) {
        var uploader = $scope.uploader = new FileUploader({
            //url: 'upload.php'
        });

        // CALLBACKS

        uploader.onAfterAddingFile = function(fileItem) {
            $scope.processing = true;
            console.info('onAfterAddingFile', fileItem);

            var data = new FormData();
            data.append('file', fileItem._file);
            data.append('file_format', fileItem.file.type);
            $scope.item = uploader.queue[uploader.queue.length-1];
            console.log($scope.item);
            $http.post('http://localhost:8080/convert',data, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            }).then(function(response){
                $scope.processing = false;
                console.info(response);

                if (response && response.data.length > 0) {
                    $scope.MOLdata = response.data[0].outputLog.split("M  END")[0];
                    $scope.inchiCode = response.data[0].inchiCode.split("InChI=")[1];
                    $scope.inchiKey = response.data[0].outputLog.split("<InChI_key>")[1].split("$$$$")[0];
                    sketcher.loadMolecule(ChemDoodle.readMOL($scope.MOLdata));
                } else {
                    $scope.inchiCode = "not found";
                    $scope.inchiKey = "not found";
                    sketcher.clear();
                }
            });
            console.log(uploader);
            var uploaderTop = $scope.uploaderTop = [ uploader.queue[uploader.queue.length-1] ];
            console.log(uploaderTop);
        };
    }]);