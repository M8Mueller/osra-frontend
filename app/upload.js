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
                console.info(response);

                $scope.MOLdata = response.data[0].outputLog.split("M  END")[0];
                sketcher.loadMolecule(ChemDoodle.readMOL($scope.MOLdata));
            });
            console.log(uploader);
            var uploaderTop = $scope.uploaderTop = [ uploader.queue[uploader.queue.length-1] ];
            console.log(uploaderTop);
        };
    }]);