/**
 * Created by matthewmueller on 9/23/16.
 */
'use strict';


angular


    .module('myApp')

    .directive('chemicalSketcher', [function(gwCtsService/*, $log*/) {
            var directive = {
                restrict: "A",
                replace: false,
                require: 'ngModel',

                scope: {
                    //id of the object
                    id: '@id',
                    //our model
                    bindModel: '=ngModel',
                    //is it a viewer
                    readonly: '=?',
                    //wished width
                    width: '=?',
                    //wished height
                    height: '=?'
                },
                /**
                 * links our sketcher into the directive
                 * @param $scope
                 * @param element
                 * @param attrs
                 * @param ngModel
                 */
                link: function($scope, element, attrs, ngModel) {

                    /**
                     * default properties
                     * @type {number|*}
                     */
                    $scope.width = $scope.width || 500;
                    $scope.height = $scope.height || 300;
                    $scope.readonly = $scope.readonly || false;

                    console.log('scope: ',$scope);
                    //only render if we got an id object
                    if (angular.isDefined($scope.id)) {
                        console.log('id: ',$scope.id);
                        var myId = $scope.id + '_sketcher';

                        element.append('<canvas id="' + myId + '"></canvas>');

                        var sketcher = null;

                        // //we can only view
                        // if ($scope.readonly) {
                        //     sketcher = new ChemDoodle.ViewerCanvas(myId, $scope.width, $scope.height);
                        // }
                        // //we can draw
                        // else {
                            sketcher = new ChemDoodle.SketcherCanvas(myId, $scope.width, $scope.height, {
                                useServices: false,
                                oneMolecule: true
                            });
                        // }

                        sketcher.specs.atoms_displayTerminalCarbonLabels_2D = true;
                        sketcher.specs.atoms_useJMOLColors = true;
                        sketcher.specs.bonds_clearOverlaps_2D = true;
                        // sketcher.toolbarManager.buttonSave.disable();


                        /**
                         * checks if our model has a molFile attribute or assumes that it's an inchiKey
                         * @param model spectrum object or inchi key
                         */
                        var getMoleculeForModel = function(model) {

                            // model is array of object, we need to get the first one only
                            if (Array.isArray(model)) {
                                model = model[0];
                            }

                            if (angular.isDefined(model)) {
                                if (angular.isDefined(model.molFile) || (angular.isString(model) && model.indexOf('M  END') > -1)) {
                                    var molFile = angular.isDefined(model.molFile) ? model.molFile : model;

                                    try {
                                        //$log.debug('rendering mol file: \n' + molFile);

                                        if (molFile.indexOf('\n') > 0) {
                                            var mol = ChemDoodle.readMOL("\n" + molFile + "\n");
                                            sketcher.loadMolecule(mol);
                                        }
                                        else {
                                            var mol = ChemDoodle.readMOL(molFile);
                                            sketcher.loadMolecule(mol);
                                        }
                                        sketcher.repaint();
                                    } catch (e) {
                                        // $log.warn('problem rendering mol file:\n\n' + molFile);
                                        // $log.warn(e);
                                    }

                                    return 'mol';
                                }

                                // else if (angular.isString(model) && /^[A-Z]{14}-[A-Z]{10}-[A-Z]$/.test(model)) {
                                //     $log.debug('Converting from InChIKey to MOL: '+ model);
                                //
                                //     gwCtsService.convertInchiKeyToMol(model, function(molecule) {
                                //         var mol = ChemDoodle.readMOL(molecule);
                                //         sketcher.loadMolecule(mol);
                                //     });
                                //
                                //     return 'inchikey';
                                // }
                            }

                        };

                        /**
                         * get an initial value, which was set in our model.
                         */
                        var moleculeType = 'mol';

                        if (angular.isDefined($scope.bindModel) /*&& $scope.readonly === true*/) {
                            moleculeType = getMoleculeForModel($scope.bindModel);
                        }

                        /**
                         * get the actual molecule information and tell our parent scope that this value needs updating. Obviously in case of a read only sketcher we ignore it
                         */
                        // if ($scope.readonly === false) {
                        //     sketcher.click = function() {
                        //         //make sure everything is in the angular context
                        //         $scope.$apply(
                        //           function() {
                        //               var mol = sketcher.getMolecule();
                        //               var molFile = ChemDoodle.writeMOL(mol);
                        //
                        //               //$log.debug('received click event and trying to generate inchi for: ' + molFile);
                        //               //gwCtsService.convertToInchiKey(molFile, function (result) {
                        //               //
                        //               //    //$log.debug('received result: ' + result);
                        //               //    $scope.bindModel = result.inchikey;
                        //               //
                        //               //});
                        //
                        //               console.log(molFile);
                        //
                        //               // Export as MOL file
                        //               $scope.bindModel = molFile;
                        //           }
                        //         );
                        //     };
                        // }

                        /**
                         * tracks changes to the model and if it's changes attempt to draw the structure
                         */
                        $scope.$watch(function() {
                            return $scope.bindModel;
                        }, function(newValue, oldValue) {
                            if (newValue !== oldValue) {
                                getMoleculeForModel(newValue);
                            }
                        });


                        /**
                         * destroy our sketcher - doesn't work
                         */
                        $scope.$on("$destroy", function() {
                            sketcher = null;
                            var sameLevelElems = element.children();

                            for (var i = 0; i < sameLevelElems.length; i++) {
                                sameLevelElems[i].remove();
                            }
                        });
                    }
                }
            };

            return directive;
        }])


    // Angular File Upload module does not include this directive
    // Only for example


    /**
     * The ng-thumb directive
     * @author: nerv
     * @version: 0.1.2, 2014-01-09
     */
    .directive('ngThumb', ['$window', function($window) {
        var helper = {
            support: !!($window.FileReader && $window.CanvasRenderingContext2D),
            isFile: function(item) {
                return angular.isObject(item) && item instanceof $window.File;
            },
            isImage: function(file) {
                var type =  '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
                return '|jpg|png|jpeg|bmp|gif|tiff|tif|'.indexOf(type) !== -1;
            },
            isTiff: function(file) {
                var type =  '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
                return '|tiff|tif|'.indexOf(type) !== -1;
            }
        };

        return {
            restrict: 'A',
            template: '<canvas/>',
            link: function(scope, element, attributes) {
                if (!helper.support) return;

                var params = scope.$eval(attributes.ngThumb);

                //console.log(params);

                if (!helper.isFile(params.file)) return;
                if (!helper.isImage(params.file)) return;
                if (helper.isTiff(params.file)) {
                    //console.log('This bad boy is a TIFF');
                    //var canvas = element.find('canvas');

                    var reader = new FileReader();

                    reader.onload = function() {
                        var buffer = this.result;
                        var tiff = new Tiff({buffer: buffer});
                        var canvas = tiff.toCanvas();
                        var oldCanvas = element.find('canvas');
                        var parent = oldCanvas[0].parentNode;
                        //console.log(parent);
                        parent.removeChild(oldCanvas[0]);
                        parent.appendChild(canvas);
                        //console.log(parent);
                    };
                    reader.readAsArrayBuffer(params.file);

                } else {
                    //console.log('This bad boy is not a TIFF');
                    var canvas = element.find('canvas');
                    var reader = new FileReader();

                    reader.onload = onLoadFile;
                    reader.readAsDataURL(params.file);

                    function onLoadFile(event) {
                        var img = new Image();
                        img.onload = onLoadImage;
                        img.src = event.target.result;
                    }

                    function onLoadImage() {
                        //console.log(params);
                        var width = params.width || this.width / this.height * params.height;
                        var height = params.height || this.height / this.width * params.width;
                        canvas.attr({ width: width, height: height });
                        canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
                    }

                }

            }
        };
    }]);