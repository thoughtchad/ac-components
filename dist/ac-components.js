(function() {


// Create all modules and define dependencies to make sure they exist
// and are loaded in the correct order to satisfy dependency injection
// before all nested files are concatenated by Grunt

// Config
angular.module('acComponents.config', [])
    .value('acComponents.config', {
        debug: true
    })
    .value('acConfig',{
        reportTypes : ['quick', 'avalanche', 'snowpack', 'weather', 'incident'],
        minFilters: ['avalanche', 'quick', 'snowpack', 'incident', 'weather'],
        dateFilters : ['7-days','1-days','3-days', '14-days', '30-days']
  })
    .constant('AC_API_ROOT_URL', 'http://avalanche-canada-min.elasticbeanstalk.com');
    //.constant('AC_API_ROOT_URL', 'http://localhost:9000');

// Modules
angular.module('acComponents.controllers', []);
angular.module('acComponents.directives', []);
angular.module('acComponents.filters', []);
angular.module('acComponents.services', []);
angular.module('acComponents',
    [
        'acComponents.config',
        'acComponents.controllers',
        'acComponents.directives',
        'acComponents.filters',
        'acComponents.services',
        'acComponents.templates',
        'ngSanitize'
    ]);

'use strict';

angular.module('acComponents.controllers')
  .controller('acMapModal', ["$scope", "$modalInstance", "latlng", "$timeout", function ($scope, $modalInstance, latlng, $timeout) {

    $scope.params = {
      latlng: latlng
    };

    $scope.save = function () {
      $modalInstance.close($scope.params.latlng);
    };

    $modalInstance.opened.then(function () {
      $timeout( function () {
        $scope.show = true;
      }, 0);
    })
  }]);

angular.module('acComponents.directives')
  .directive('acAllminIcon', function () {
    return {
      replace: true,
      templateUrl: 'allmin-icon.html',
      link: function ($scope, el, attrs) {

      }
    };
  });

angular.module('acComponents.directives')
    .directive('acDangerIcon', function () {
        return {
            replace: true,
            templateUrl: 'danger-icon.html',
            link: function ($scope, el, attrs) {
                
            }
        };
    });
angular.module('acComponents.directives')
    .directive('acDatetimePicker', function () {
        return function () {
            if(jQuery().datetimepicker) {
                var options = {
                    format: "YYYY-MM-DD hh:mm A"
                };
                $('.min-form').first().find('[type="datetime"]').datetimepicker(options);
            }
        }
    });
angular.module('acComponents.directives')
    .directive('acDrawer', function () {
        return {
            replace: true,
            transclude: true,
            scope: true,
            templateUrl: 'drawer.html',
            link: function ($scope, el, attrs) {
              $scope.drawerPosition = attrs.acDrawerPosition;
            }
        };
    });

angular.module('acComponents.directives')
  .directive('acEnter', function () {
    return function (scope, element, attrs) {
      element.bind("keydown keypress", function (event) {
        if(event.which === 13) {
          scope.$apply(function (){
            scope.$eval(attrs.acEnter);
          });

          event.preventDefault();
        }
      });
    };
});

angular.module('acComponents.directives')
    .directive('acForecastMini', ["AC_API_ROOT_URL", function (AC_API_ROOT_URL) {
        return {
            templateUrl: 'forecast-mini.html',
            scope: {
                forecast: '=acForecast',
                dangerRating: '=dangerRating',
                disclaimer: '=disclaimer',
                sponsor: '=sponsor'
            },
            link: function ($scope, el, attrs) {
                el.addClass('ac-forecast-mini');
                $scope.apiUrl = AC_API_ROOT_URL;
            }
        };
    }]);

angular.module('acComponents.directives')
    .directive('acLoadingIndicator', function () {
        return {
            templateUrl: 'loading-indicator.html',
            replace: true,
            link: function ($scope, el, attrs) {

            }
        };
    });
angular.module('acComponents.directives')
    .directive('acLocationSelect', ["MAPBOX_ACCESS_TOKEN", "MAPBOX_MAP_ID", "$timeout", function(MAPBOX_ACCESS_TOKEN, MAPBOX_MAP_ID, $timeout) {
        return {
            scope: {
                latlng: '='
            },
            link: function($scope, el, attrs) {
                var map, marker;
                L.mapbox.accessToken = MAPBOX_ACCESS_TOKEN;

                function setLatlng(latlng){
                    $timeout(function () {
                        $scope.latlng = [latlng.lat, latlng.lng];
                    }, 0);
                }

                $('#minForm').on('shown.bs.modal', function (e) {
                    map.invalidateSize();
                });

                map = L.mapbox.map(el[0], MAPBOX_MAP_ID, {
                    attributionControl: false,
                    scrollWheelZoom: true
                }).on('click', function (e) {
                    if (!marker) {
                        setLatlng(e.latlng);
                        createMarker (e.latlng);

                    } else if(marker && !map.hasLayer(marker)) {
                        setLatlng(e.latlng);
                        marker
                            .setLatLng(e.latlng)
                            .addTo(map)
                            .openPopup();
                    }
                });

                map.setView([52.3, -120.74966], 5);

                var watch = $scope.$watch('latlng', function (latlng) {
                    var location;
                    if (marker && latlng.length === 0) {
                        map.removeLayer(marker);
                    } else if (!marker && latlng.length > 0) {
                        location = L.latLng(latlng[0], latlng[1]);
                        createMarker(location);
                        map.panTo(location);
                    } else if (marker && latlng.length > 0) {
                        location = L.latLng(latlng[0], latlng[1]);
                        marker.setLatLng(location);
                        setPopupContent(location);
                        map.panTo(location);
                    }
                });

                $scope.$on('$destroy', function () {
                  watch();
                });

                function setPopupContent(location) {
                  marker.setPopupContent('Position: ' + location.toString().substr(6) + '<br/>(drag to relocate)');
                  marker.openPopup();
                }

                function createMarker (latlng) {
                    marker = L.marker(latlng, {
                      icon: L.mapbox.marker.icon({
                        'marker-color': 'f79118'
                      }),
                      draggable: true
                    });

                    marker.bindPopup('Position: ' + latlng.toString().substr(6) + '<br/>(drag to relocate)')
                      .addTo(map)
                      .openPopup();

                    marker.on('dragend', function(e) {
                      var location = marker.getLatLng();
                      setPopupContent(location);
                      setLatlng(location);
                    });
                  }
            }
        };
    }]);

angular.module('acComponents.directives')
  .directive('acMapboxMap', ["$rootScope", "$window", "$location", "$timeout", "acBreakpoint", "acObservation", "acForecast", "acSubmission", "MAPBOX_ACCESS_TOKEN", "MAPBOX_MAP_ID", "$stateParams", function ($rootScope, $window, $location, $timeout, acBreakpoint, acObservation, acForecast, acSubmission, MAPBOX_ACCESS_TOKEN, MAPBOX_MAP_ID, $stateParams) {
    return {
      template: '<div id="map"></div>',
      replace: true,
      scope: {
        region: '=acRegion',
        regions: '=acRegions',
        showRegions: '=acShowRegions',
        obs: '=acObs',
        ob: '=acOb',
        minFilters: '=acMinFilters',
        currentReport: '=acReport'
      },
      link: function ($scope, el, attrs) {
        $scope.device = {};
        $scope.showRegions = $scope.showRegions || true;
        var layers = {
          dangerIcons: L.featureGroup()
        };
        var styles = {
          region: {
            default: {
              fillColor: 'transparent',
              color: 'transparent'
            },
            selected: {
              fillColor: '#489BDF'
            },
            hover: {
              color: '#B43A7E'
            },
            selectedhover: {
              fillColor: '#489BDF',
              color: '#B43A7E'
            }
          },
          reportType: {
            incident: '#F44336',
            quick: '#4CAF50',
            avalanche: '#03A9F4',
            snowpack: '#3F51B5',
            weather: '#FFC107'
          },
          clusterColor: '#607D8B'
        };

        L.mapbox.accessToken = MAPBOX_ACCESS_TOKEN;
        var map = L.mapbox.map(el[0].id, MAPBOX_MAP_ID, {
          attributionControl: false,
          center: [52.3, -120.74966],
          maxZoom: 10,
          minZoom: 4,
          zoom: 6,
          zoomControl: false
        });
        var clusterOverlays = L.layerGroup().addTo(map);

        addMapControls();

        function addMapControls(){
          L.control.locate({
            locateOptions: {
              maxZoom: 14
            },
            position: 'bottomright'
          }).addTo(map);

          new L.Control.Zoom({ position: 'bottomright' }).addTo(map);
        }


        acBreakpoint.setBreakpoints({
          xs: 480,
          sm: 600,
          md: 1025
        });

        $rootScope.$on('breakpoint', function (e, breakpoint) {
          $scope.device.size = breakpoint;
        });

        function getInvalidateSize(topOffset) {
          return function () {
            el.height($($window).height() - Number(topOffset));
            map.invalidateSize();
          }
        }

        if (attrs.topOffset) {
          var offset = Number(attrs.topOffset);
          var invalidateSize = getInvalidateSize(offset);

          angular.element(document).ready(invalidateSize);
          angular.element($window).bind('resize', invalidateSize);
        }

        function getDangerIcon(options) {
          var size = map.getZoom() <= 6 ? 60 : 80;

          return L.icon({
            iconUrl: options.iconUrl || acForecast.getDangerIconUrl(options.regionId),
            iconSize: [size, size],
            labelAnchor: [6, 0]
          });
        };

        function initRegionsLayer() {
          layers.regions = L.geoJson($scope.regions, {
            style: function (feature) {
              return styles.region.default;
            },
            onEachFeature: function (featureData, layer) {
              layer.bindLabel(featureData.properties.name);

              function showRegion(evt) {
                if (map.getZoom() < 9) {
                  var padding = getMapPadding();

                  map.fitBounds(layer.getBounds(), {
                    paddingBottomRight: padding
                  });
                }

                layers.currentRegion = layer;

                $scope.$apply(function () {
                  $scope.region = layer;
                });

              }

              layer.on('click', showRegion);

              layer.on('mouseover', function () {
                if (layer == layers.currentRegion) {
                  layer.setStyle(styles.region.selectedhover);
                } else {
                  layer.setStyle(styles.region.hover);
                }
              });

              layer.on('mouseout', function () {
                if (layer == layers.currentRegion) {
                  layer.setStyle(styles.region.selected);
                } else {
                  layer.setStyle(styles.region.default);
                }
              });

              if (featureData.properties.centroid) {
                var centroid = L.latLng(featureData.properties.centroid[1], featureData.properties.centroid[0]);

                var marker = L.marker(centroid);
                var icon = getDangerIcon({regionId: featureData.id});

                marker.setIcon(icon);
                var zindex = 1;
                marker.setZIndexOffset(zindex);

                marker.on('click', function () {
                  //zindex = zindex === 1 ? 200 : 1;
                  //smarker.setZIndexOffset(zindex);
                  showRegion();
                });

                layers.dangerIcons.addLayer(marker);
              }
            }
          });

          refreshLayers();
        }

        function refreshDangerIconsLayer() {
          layers.dangerIcons.eachLayer(function (dangerIconLayer) {
            var iconUrl = dangerIconLayer.options.icon.options.iconUrl;
            var icon = getDangerIcon({iconUrl: iconUrl});

            dangerIconLayer.setIcon(icon);
          });
        }

        function refreshLayers() {
          var zoom = map.getZoom();

          if (layers.regions && $scope.showRegions) {
            var regionsVisible = map.hasLayer(layers.regions);

            if (zoom < 6 && regionsVisible) {
              map.removeLayer(layers.regions);
            } else if (zoom >= 6 && !regionsVisible) {
              map.addLayer(layers.regions);
            } else if (zoom > 10 && regionsVisible) {
              map.removeLayer(layers.regions);
            }
          }

          if (layers.dangerIcons) {
            var dangerIconsVisible = map.hasLayer(layers.dangerIcons);

            if (map.getZoom() < 6 && dangerIconsVisible) {
              map.removeLayer(layers.dangerIcons);
            } else if (map.getZoom() >= 6 && !dangerIconsVisible) {
              map.addLayer(layers.dangerIcons);
            }

            var dangerIcon = layers.dangerIcons.getLayers()[0];
            if (dangerIcon) {
              var dangerIconSize = dangerIcon.options.icon.options.iconSize[0];
              if ((zoom > 6 && dangerIconSize === 60) || (zoom <= 6 && dangerIconSize === 80)) {
                refreshDangerIconsLayer();
              }
            }
          }

          if (layers.obs) {
            //map.addLayer(layers.obs);
          }

          var opacity = 0.2;
          if (layers.currentRegion && $scope.showRegions) {
            if (zoom <= 9) {
              styles.region.selected.fillOpacity = opacity;
              layers.currentRegion.setStyle(styles.region.selected);
            } else if (zoom > 9 && zoom < 13) {
              switch (zoom) {
                case 10:
                  opacity = 0.15;
                  break;
                case 11:
                  opacity = 0.10;
                  break;
                case 12:
                  opacity = 0.05;
                  break;
              }

              styles.region.selected.fillOpacity = opacity;
              layers.currentRegion.setStyle(styles.region.selected);
            } else {
              layers.currentRegion.setStyle(styles.region.default);
            }
          }

          getFilters();
        }

        function getMarkerColor(type) {
          if (_.isUndefined(type)){
            type = 'quick';
          }
          return styles.reportType[type];
        }

        function getFilters() {

        }

        function refreshObsLayer() {
          clusterOverlays.clearLayers();

          if ($scope.obs && $scope.obs.length > 0) {
            var markers = new L.markerClusterGroup().addTo(clusterOverlays);

            $scope.obs.map(function (ob) {

              var marker = L.mapbox.featureLayer({
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [ob.latlng[1], ob.latlng[0]]
                },
                properties: {
                  'marker-size': 'small',
                  'marker-color': getMarkerColor(ob.obtype),
                  zIndexOffset: 1000
                }
              })
                .setFilter(function () {
                  if (_.indexOf($scope.minFilters, ob.obtype) !== -1) {
                    return true;
                  } else {
                    return false;
                  }
                });

              marker.on('click', function (e) {
                $rootScope.requestInProgress = true;

                acSubmission.getOne(ob.subid).then(function(results){
                  results.requested = ob.obtype;
                  $scope.currentReport = results;
                  $rootScope.requestInProgress = false;
                });
              });

              marker.eachLayer(function (layer) {
                markers.addLayer(layer);
              });

            });

          } else {

            clusterOverlays.clearLayers();
          }

          refreshLayers();
        }

        function latLngToGeoJSON(latlng) {
          return {
            type: 'Point',
            coordinates: [latlng.lng, latlng.lat]
          };
        }

        function getMapPadding() {
          switch ($scope.device.size) {
            case 'xs':
              return L.point([0, 0]);
            case 'sm':
              return L.point([350, 0]);
            case 'md':
            case 'lg':
              return L.point([480, 0]);
            default:
              return L.point([0, 0]);
          }
        }

        function getMapOffset() {
          return getMapPadding().divideBy(2);
        }

        // offfset can be negative i.e. [-240, 0]
        function offsetLatLng(latlng, offset) {
          var point = map.latLngToLayerPoint(latlng);
          return map.layerPointToLatLng(point.subtract(offset));
        }

        function getMapCenter() {
          var offset = getMapOffset();
          return offsetLatLng(map.getCenter(), offset);
        }


        function setRegionFocus() {
          if ($scope.showRegions) {
            var regionLayers = layers.regions.getLayers();
            var mapCenter = getMapCenter();

            var region = _.find(regionLayers, function (r) {
              return gju.pointInPolygon(latLngToGeoJSON(mapCenter), r.feature.geometry);
            });

            if (!region) {
              region = _.min(regionLayers, function (r) {
                var centroid = L.latLng(r.feature.properties.centroid[1], r.feature.properties.centroid[0]);
                return centroid.distanceTo(mapCenter);
              });
            }

            if (region) setRegion(region);
          }
        }

        function setRegion(region) {
          layers.currentRegion = region;
          if ($scope.region !== region) {
            $timeout(function () {
              $scope.region = region;
            }, 10);
          }

          layers.regions.eachLayer(function (layer) {
            if (layer === region) {
              layer.setStyle(styles.region.selected);
            } else {
              layer.setStyle(styles.region.default);
            }
          });
        }


        map.on('load', refreshLayers);
        //map.on('dragend', setRegionFocus);
        map.on('zoomend', refreshLayers);

        $scope.$watch('region', function (newRegion, oldRegion) {
          if (layers.regions && newRegion && newRegion !== oldRegion) {
            setRegion(newRegion);
          }
        });

        $scope.$watch('regions', function (newRegions, oldRegions) {
          if (newRegions && newRegions.features) {
            initRegionsLayer();
          }
        });

        $scope.$watch('showRegions', function (newShowRegions, oldShowRegions) {
          if (newShowRegions !== oldShowRegions) {
            if (!newShowRegions && map.hasLayer(layers.regions)) {
              if (layers.currentRegion) {
                $scope.region = null;
                layers.currentRegion.setStyle(styles.region.default);
              }
              map.removeLayer(layers.regions);
            } else if (newShowRegions && !map.hasLayer(layers.regions)) {
              map.addLayer(layers.regions);
              setRegionFocus();
            }
          }
        });

        $scope.$watch('obs', function (newObs, oldObs) {
          if (newObs) {
            refreshObsLayer();
          }
        });

        $scope.$watch('minFilters', function (newObs, oldObs) {
          if (newObs) {
            refreshObsLayer();
          }
        }, true);

        $scope.$watch('currentReport', function(newVal, oldVal){

          if($stateParams.subid && newVal && newVal.latlng){
            clusterOverlays.clearLayers();
            var markers = new L.markerClusterGroup().addTo(clusterOverlays);

            newVal.obs.map(function (ob) {
              var marker = L.mapbox.featureLayer({
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [newVal.latlng[1], newVal.latlng[0]]
                },
                properties: {
                  'marker-size': 'small',
                  'marker-color': getMarkerColor(ob.obtype),
                  zIndexOffset: 1000
                }
              })
                .setFilter(function () {
                  if (_.indexOf($scope.minFilters, ob.obtype) !== -1) {
                    return true;
                  } else {
                    return false;
                  }
              });;

              marker.on('click', function (e) {
                $rootScope.requestInProgress = true;

                acSubmission.getOne(newVal.subid).then(function(results){
                  results.requested = ob.obtype;
                  $scope.currentReport = results;
                  $rootScope.requestInProgress = false;
                });
              });

              marker.eachLayer(function (layer) {
                markers.addLayer(layer);
              });
            });
            map.setView(newVal.latlng, 10);
          }
        }, true);

        $scope.$watch('ob', function (newObs, oldObs) {
          if (newObs && newObs.latlng) {
            acObservation.getOne(newObs.obid, 'html').then(function (obHtml) {
              var marker = L.marker(newObs.latlng, {
                icon: L.mapbox.marker.icon({
                  'marker-size': 'small',
                  'marker-color': '#09c'
                })
              });
              var maxHeight = map.getSize().y - 100;

              marker.bindPopup(obHtml, {maxHeight: maxHeight, maxWidth: 400, autoPanPaddingTopLeft: [0, 30]});
              marker.on('popupclose', function () {
                map.removeLayer(marker);
                $timeout(function () {
                  $location.path('/');
                }, 0);
              });

              marker.setZIndexOffset(10000);
              map.addLayer(marker);

              marker.togglePopup();
            });
            acObservation.getOne(newObs.obid, 'json').then(function (ob) {
              // add opengraph tags
              $rootScope.ogTags = [{type: 'title', value: ob.title},
                {type: 'image', value: ob.thumbs[0]},
                {type: 'description', value: ob.comment}];
            });
          }
        });

      }
    };
  }]);

angular.module('acComponents.directives')
    .directive('fileModel', ["$parse", function($parse) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var model = $parse(attrs.fileModel);
                var modelSetter = model.assign;

                element.bind('change', function() {
                    scope.$apply(function() {
                        modelSetter(scope, element[0].files);
                    });
                });
            }
        };
    }])
    .directive('acMinReportForm', ["$state", "$q", "$timeout", "acBreakpoint", "acQuickReportData", "acAvalancheReportData", "acIncidentReportData", "acSnowpackReportData", "acWeatherReportData", "acFormUtils", "acSubmission", "MAPBOX_ACCESS_TOKEN", "MAPBOX_MAP_ID", "store", "$anchorScroll", "$modal", function($state, $q, $timeout, acBreakpoint, acQuickReportData, acAvalancheReportData, acIncidentReportData, acSnowpackReportData, acWeatherReportData, acFormUtils, acSubmission, MAPBOX_ACCESS_TOKEN, MAPBOX_MAP_ID, store, $anchorScroll, $modal) {
        return {
            templateUrl: 'min-report-form.html',
            replace: true,
            link: function($scope, el, attrs) {

                var submissionGuidelinesLink = 'http://www.avalanche.ca/fxresources/Submissions+Guidelines.pdf';

                initReport();

                $scope.additionalFields = {
                  avalancheReport : {
                    name: 'Avalanche',
                    text: 'Share information about a single, notable avalanche or tell us about overall avalanche conditions by describing many avalanches in a general sense. Aspect, elevation, trigger, dimensions/size are key data.'
                  },
                  snowpackReport : {
                    name: 'Snowpack',
                    text: 'Snowpack depth, layering, and bonding are key data. Test results are very useful.'
                  },
                  weatherReport : {
                    name: 'Weather',
                    text: 'Key data includes information about current and accumulated precipitation, wind speed and direction, temperatures, and cloud cover.'
                  },
                  incidentReport : {
                    name: 'Incident',
                    text: 'Sharing incidents can help us all learn. Describe close calls and accidents here. Be sensitive to the privacy of others. Before reporting serious accidents check our <a href="'+submissionGuidelinesLink+'" target="_blank">submission guidelines</a>.'
                  }
                };

                $scope.atleastOneTabCompleted = false;

                $scope.getTabExtraClasses = function (tab) {
                  var completed = tabCompleted(tab);

                  $scope.atleastOneTabCompleted = $scope.atleastOneTabCompleted || completed;

                  return {
                    completed: completed
                  }
                };

                $scope.scrollToTop = function () {
                  $anchorScroll.yOffset = 100;
                  $anchorScroll('top');
                };

                function tabCompleted (tab) {
                  if (tab === 'quickReport') {
                    return acQuickReportData.isCompleted($scope.report.obs.quickReport);
                  } else {
                    return $scope.report.obs[tab].isCompleted();
                  }
                }

                function initReport() {
                  $scope.report = {
                    title: '',
                    datetime: moment().format('YYYY-MM-DD hh:mm A'),
                    latlng: [],
                    files: [],
                    obs: {
                      quickReport: {
                        ridingConditions: angular.copy(acQuickReportData.ridingConditions),
                        avalancheConditions: angular.copy(acQuickReportData.avalancheConditions),
                        comment: null
                      },
                      avalancheReport: acAvalancheReportData,
                      incidentReport: acIncidentReportData,
                      snowpackReport: acSnowpackReportData,
                      weatherReport: acWeatherReportData
                    }
                  };
                }

                function resetForm() {
                    $timeout(function () {
                        resetFields();
                        initReport();
                        $scope.minsubmitting = false;
                        $scope.minerror = false;
                    }, 0);
                }

                function resetFields() {
                  acAvalancheReportData.reset();
                  acIncidentReportData.reset();
                  acSnowpackReportData.reset();
                  acWeatherReportData.reset();
                }

                $scope.resetForm = resetForm;

                $scope.goBack = function () {
                  resetForm();
                  $state.go('ac.map');
                };

                $scope.submitForm = function() {

                    var reqObj = _.cloneDeep($scope.report);

                    reqObj.obs = _.reduce($scope.report.obs, function(total, item, key){
                        if (key === 'quickReport') {
                          if (acQuickReportData.isCompleted(item)) {
                            total.quickReport = item;
                          }
                        } else if (item.isCompleted()){
                          total[key] = item.getDTO();
                        }
                        return total;
                    }, {});

                    if (_.keys(reqObj.obs).length === 0) {
                      return $q.reject('incomplete-form');
                    }

                    //console.log('to be sent: ', reqObj.obs);
//return;
                    var token = store.get('token');
                    if (token) {
                        $scope.minsubmitting = true;
                        return acSubmission.submit(reqObj, token).then(function(result) {
                            if (result.data && !('error' in result.data)) {
                                $scope.minsubmitting = false;
                                $scope.report.subid = result.data.subid;
                                $scope.report.shareUrl = result.data.obs[0].shareUrl;
                                console.log('submission: ' + result.data.subid);
                                return result;
                            } else {
                                $scope.minsubmitting = false;
                                $scope.minerror = true;
                                return $q.reject('error');
                            }
                        }, function(err) {
                            $scope.minsubmitting = false;
                            $scope.minerror = true;
                            $scope.minerrormsg = err;
                            return $q.reject(err);
                        });
                    } else {
                        return $q.reject('auth-error');
                    }
                };

                $scope.openMapModal = function () {
                  var modalInstance = $modal.open({
                    animation: false,
                    templateUrl: 'min-map-modal.html',
                    controller: 'acMapModal',
                    size: 'lg',
                    windowClass: 'map-modal',
                    resolve: {
                      latlng: function () {
                        return $scope.report.latlng
                      }
                    }
                  });

                  modalInstance.result.then(function (latlng) {
                    $scope.report.latlng = latlng;
                  });
                };

                var watch = $scope.$watchCollection(function () { return [$scope.report.latlng, $scope.report.tempLatlng]; }, function (newVal, oldVal) {
                  if (newVal) {
                    if (newVal[0] !== oldVal[0]) {
                      $scope.report.tempLatlng = $scope.report.latlng.join(',');
                      newVal[1] = $scope.report.tempLatlng;
                      $scope.tempLatlngModified = false;
                    }
                    if (newVal[1] && newVal[1] !== newVal[0].join(',')) {
                      $scope.tempLatlngModified = true;
                    }
                  }
                });

                $scope.$on('$destroy', function () {
                  watch();
                });

                $scope.saveLocation = function () {
                  if (acFormUtils.validateLocationString($scope.report.tempLatlng)) {
                    $scope.report.latlng = $scope.report.tempLatlng.split(',');
                    $scope.tempLatlngModified = false;
                    $scope.invalidLatLng = false;
                  } else {
                    $scope.invalidLatLng = true;
                  }
                };
            }
        };
    }]);

angular.module('acComponents.directives')
    .directive('acMinReportModal', function () {
        return {
            templateUrl: 'min-report-modal.html',
            replace: true,
            link: function ($scope, el, attrs) {

            }
        };
    });
angular.module('acComponents.directives')
  .directive('acObservationMin', ["acReportData", "acConfig", "$stateParams", "$state", function (acReportData, acConfig, $stateParams, $state) {
    return {
      templateUrl: 'min-observation-drawer.html',
      scope: {
        sub: '=observation',
        sponsor: '=sponsor'
      },
      link: function (scope, el, attrs) {
        el.addClass('ac-observation-drawer');

        scope.activeTab = {};
        scope.reportTypes = acConfig.reportTypes;
        scope.hasReport = hasReport;
        scope.changeTab = changeTab;
        scope.closeDrawer = closeDrawer;

        function hasReport(type) {
          if (!scope.sub) return;

          var completedReports = _.reduce(scope.sub.obs, function (list, item) {
            list.push(item.obtype);
            return list;
          }, []);

          if (_.indexOf(completedReports, type) !== -1) {
            return 'completed';
          } else {
            return 'disabled';
          }
        }

        function closeDrawer() {
          scope.sub = null;
          if($stateParams.subid){
            $state.go('ac.map');
          }
        }

        function changeTab(tab) {
          if (hasReport(tab) === 'disabled') {
            return false;
          } else {
            scope.sub.requested = tab;
            processTabInfo(scope.sub);
          }
        }

        scope.$watch('sub', function (newValue, oldValue) {
          if (newValue && newValue.latlng) {
            processTabInfo(newValue);
          }
        });

        function processTabInfo(newObj) {
          newObj.requested = requestedTab(newObj);

          var requestedObj = _.filter(newObj.obs, function (ob) {
            return newObj.requested === ob.obtype;
          });

          if (newObj.requested === 'quick') {
            requestedObj = _.filter(newObj.obs, function (ob) {
              return newObj.requested === ob.obtype;
            });
            scope.activeTab = mapQuickObject(requestedObj[0].ob);
            return;
          }

          if (requestedObj[0].ob) {
            scope.activeTab = acReportData[newObj.requested].mapDisplayResponse(requestedObj[0].ob);
          }
        }

        function requestedTab(newObj){
          if(newObj.requested){
            return newObj.requested;
          } else {
            var requested = null;
            _.forEach(scope.reportTypes, function (item){
              if(_.some(newObj.obs, {obtype:item})){
                requested = item;
                return false;
              }
            });
            return requested;
          }
        }

        function mapQuickObject(ob) {
          var quickTab = [];

          if (ob.avalancheConditions && mapAvalancheConditions(ob.avalancheConditions).length > 0) {
            quickTab.push({
              prompt: 'Avalanche conditions',
              type: 'checkbox',
              order: 2,
              value: mapAvalancheConditions(ob.avalancheConditions)
            });
          }

          _.forEach(ob.ridingConditions, function (item, key) {
            if (item.type === 'single' && item.selected) {
              if (item.selected) {
                quickTab.push({
                  prompt: item.prompt,
                  type: 'radio',
                  order: 1,
                  value: item.selected
                });
              }
            }

            if (item.type === 'multiple' && item.options) {
              var selected = _.reduce(item.options, function (select, it, key) {
                if (it) {
                  select.push(key);
                }
                return select;
              },[]);

              if (!_.isEmpty(selected)){
                quickTab.push({
                  prompt: item.prompt,
                  type: 'checkbox',
                  order: 1,
                  value: selected
                });
              }
            }
          });

          return quickTab;
        }

        function mapAvalancheConditions(av) {
          var avalanches = [];
          if (av.slab) {
            avalanches.push('Slab avalanches today or yesterday.');
          }
          if (av.sound) {
            avalanches.push('Whumphing or drum-like sounds or shooting cracks.');
          }
          if (av.snow) {
            avalanches.push('30cm + of new snow, or significant drifitng, or rain in the last 48 hours.');
          }
          if (av.temp) {
            avalanches.push('Rapid temperature rise to near zero degrees or wet surface snow.');
          }
          return avalanches;
        }

      }
    };
  }])
  .filter('dateformat', function(){
    return function formatDate(datetimeString){
      var datetime = moment(datetimeString);
      var offset = moment.parseZone(datetimeString).zone();
      var prefixes = {
        480: 'P',
        420: 'M',
        360: 'C',
        300: 'E',
        240: 'A',
        180: 'N'
      };
      var suffix = datetime.isDST() ? 'DT' : 'ST';
      var zoneAbbr = 'UTC';

      if(offset in prefixes) {
        zoneAbbr = prefixes[offset] + suffix;
        datetime.subtract(offset, 'minutes');
      }

      return datetime.format('MMM Do, YYYY [at] HH:mm [' + zoneAbbr + ']')
    }
  });

angular.module('acComponents.directives')
    .directive('acSocialShare', function () {
        return {
            templateUrl: 'social-share.html',
            replace: true,
            link: function ($scope, el, attrs) {

            }
        };
    });
angular.module('acComponents.directives')
  .directive('acSubmissionFormValidator', function () {
    return {
      require: '^form',
      link: function ($scope, el, attrs, ctrl) {
        $scope.validate = function (fieldName, field) {
          if (!field.validate()) {
            setFormValidity(fieldName, false);
          } else {
            setFormValidity(fieldName, true);
          }
        };

        function setFormValidity(fieldName, state) {
          if (angular.isDefined(ctrl[fieldName])) {
            ctrl[fieldName].$setValidity(fieldName, state);
          }
        }

        $scope.$watch('atleastOneTabCompleted', function (newVal) {
          if (angular.isDefined(newVal)) {
            ctrl.$setValidity('atleastOneTab', newVal);
          }
        });
      }
    };
  });

angular.module('acComponents.directives')
  .directive('acTabStyle', function () {
    return {
      link: function ($scope, el, attrs) {
        attrs.$observe('acTabStyle', applyStyle);

        function applyStyle (newVal) {
          var res = JSON.parse(newVal);
          _.forEach(res, function (val, cssClass) {
            if (val) {
              el.removeClass(cssClass).addClass(cssClass);
            } else {
              el.removeClass(cssClass);
            }
          });
        }
      }
    };
  });

angular.module('acComponents.filters')
    .filter('acNormalizeForecastTitle', function () {
        return function (item) {
            if (item) {
                return item.replace(/^Avalanche (Forecast|Bulletin) - /g, '');
            }
        };
    });
'use strict';

angular.module('acComponents.filters')
    .filter('dateUtc', function () {
        return function (datePST, format) {
            if (datePST) {
                return moment.utc(datePST).format(format) ;
            }
        };
    });

angular.module('acComponents.services')
  .factory('acAvalancheReportData', ["acFormUtils", function(acFormUtils) {
    var fields = {

      avalancheOccurrenceEpoch: {
        prompt: 'Avalanche Observation Datetime',
        type: 'datetime',
        value: null,
        order: 1
      },

      avalancheNumber: {
        prompt: 'Number of avalanches in this report',
        type: 'radio',
        inline: true,
        options: ['1', '2-5', '6-10', '11-50', '51-100'],
        value: null,
        order: 2
      },

      avalancheSize: {
        prompt: 'Avalanche Size',
        type: 'radio',
        inline: true,
        value: null,
        options: ['1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5'],
        helpText: 'Use Canadian size classification. Size 1 is relatively harmless to people. Size 2 can bury, injure or kill a person. Size 3 can bury and destroy a car. Size 4 can destroy a railway car. Size 5 can destroy 40 hectares of forest.',
        order: 3
      },

      slabThickness: {
        type: 'number',
        prompt: 'Slab Thickness (centimetres)',
        value: null,
        options: {
          min: 10,
          max: 500
        },
        errorMessage: 'Number between 10 and 500 please.',
        order: 4
      },

      slabWidth: {
        type: 'number',
        prompt: 'Slab Width (meters)',
        value: null,
        options: {
          min: 1,
          max: 3000
        },
        errorMessage: 'Number between 1 and 3000 please.',
        order: 5
      },

      runLength: {
        type: 'number',
        prompt: 'Run length (meters)',
        options: {
          min: 1,
          max: 10000
        },
        value: null,
        errorMessage: 'Number between 1 and 10000 please.',
        helpText: 'Length from crown to toe of debris.',
        order: 6
      },

      avalancheCharacter: {
        type: 'checkbox',
        prompt: 'Avalanche Character',
        limit: 3,
        inline: true,
        options: {
          'Loose wet': false,
          'Loose dry': false,
          'Storm slab': false,
          'Persistent slab': false,
          'Deep persistent slab': false,
          'Wet slab': false,
          'Cornice only': false,
          'Cornice with slab': false
        },
        order: 7,
        errorMessage: 'Please check maximum 3 options.'
      },

      triggerType: {
        type: 'dropdown',
        prompt: 'Trigger Type',
        options:['Natural', 'Skier', 'Snowmobile', 'Other Vehicle', 'Helicopter', 'Explosives'],
        value: null,
        order: 8
      },

      triggerSubtype: {
        type: 'dropdown',
        prompt: 'Trigger Subtype',
        value: null,
        options: ['Accidental', 'Intentional', 'Remote'],
        helpText: 'A remote trigger is when the avalanche starts some distance away from where the trigger was  applied.',
        order: 9
      },

      triggerDistance: {
        type: 'number',
        prompt: 'Remote Trigger Distance (metres)',
        options: {
          min: 0,
          max: 2000
        },
        helpText: 'If a remote trigger, enter how far from the trigger point is the nearest part of the crown.',
        value: null,
        errorMessage: 'Number between 0 and 2000 please.',
        order: 10
      },

      startZoneAspect: {
        type: 'radio',
        inline: true,
        prompt: 'Start Zone Aspect',
        options: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
        value: null,
        order: 11
      },

      startZoneElevationBand: {
        prompt: 'Start Zone Elevation Band',
        type: 'radio',
        inline: true,
        options: ['Alpine', 'Treeline', 'Below Treeline'],
        value: null,
        order: 12
      },

      startZoneElevation: {
        type: 'number',
        prompt: 'Start Zone Elevation (metres above sea level)',
        options: {
          min: 0,
          max: 5000
        },
        value: null,
        errorMessage: 'Number between 0 and 5000 please.',
        order: 13
      },

      startZoneIncline: {
        type: 'number',
        prompt: 'Start Zone Incline',
        options: {
          min: 0,
          max: 90
        },
        value: null,
        errorMessage: 'Number between 0 and 90 please.',
        order: 14
      },

      runoutZoneElevation: {
        type: 'number',
        prompt: 'Runout Zone Elevation (metres above sea level)',
        options: {
          min: 0,
          max: 5000
        },
        helpText: 'The lowest point of the debris.',
        value: null,
        errorMessage: 'Number between 0 and 5000 please.',
        order: 15
      },

      weakLayerBurialDate: {
        prompt: 'Weak Layer Burial Date',
        type: 'datetime',
        helpText:'Date the weak layer was buried.',
        order: 16
      },

      weakLayerCrystalType: {
        type: 'checkbox',
        prompt: 'Weak Layer Crystal Type',
        limit: 2,
        inline: true,
        options: {
          'Surface hoar': false,
          'Facets': false,
          'Surface hoar and facets': false,
          'Depth hoar': false,
          'Storm snow': false
        },
        order: 17,
        errorMessage: 'Please check maximum 2 options.'
      },

      crustNearWeakLayer:{
        prompt: 'Crust Near Weak Layer',
        type: 'radio',
        inline: true,
        options: ['Yes', 'No'],
        value: null,
        order: 18
      },

      windExposure: {
        type: 'dropdown',
        prompt: 'Wind Exposure',
        options: ['Lee slope', 'Windward slope', 'Down flow', 'Cross-loaded slope', 'Reverse-loaded slope', 'No wind exposure'],
        value: null,
        order: 19
      },

      vegetationCover: {
        type: 'dropdown',
        prompt: 'Vegetation cover',
        value: null,
        options: ['Open slope', 'Sparse trees or gladed slope', 'Dense trees'],
        order: 20
      },

      avalancheObsComment: {
        prompt: 'Avalanche Observation Comment',
        type: 'textarea',
        value: null,
        helpText: 'Please add additional information, for example terrain, aspect, elevation etc. especially if describing many avalanches together.',
        order: 21
      }

    };

    return acFormUtils.buildReport(fields);

  }]);

angular.module('acComponents.services')
    .factory('acBreakpoint', ["$rootScope", "$timeout", "$window", function ($rootScope, $timeout, $window) {
        return {
            setBreakpoints: function (breakpoints) { // {xs: 400, sm: 600, md: 1025}
                var breakpoint;

                function broadcastBreakpoint() {
                    var bp;
                    var width = $($window).width();

                    if(width < breakpoints.xs) {
                        bp = 'xs';
                    } else if(width >= breakpoints.xs && width < breakpoints.sm) {
                        bp = 'sm';
                    } else if(width >= breakpoints.sm && width < breakpoints.md) {
                        bp = 'md';
                    } else {
                        bp = 'lg';
                    }

                    if(!breakpoint || bp !== breakpoint) {
                        breakpoint = bp;
                        $timeout(function () {
                            $rootScope.$broadcast('breakpoint', breakpoint);
                        }, 0);
                    }
                }

                broadcastBreakpoint();
                angular.element($window).bind('resize', broadcastBreakpoint);
            }
        };
    }]);
angular.module('acComponents.services')
    .factory('acForecast', ["$http", "$q", "acImageCache", "AC_API_ROOT_URL", function ($http, $q, acImageCache, AC_API_ROOT_URL) {
        var forecasts;
        var apiUrl = AC_API_ROOT_URL; // todo: move to constants

        function cacheDangerIcons(){
            var dangerIcons = _.map(forecasts.features, function (f) {
                return apiUrl + f.properties.dangerIconUrl;
            });

            acImageCache.cache(dangerIcons);
        }

        return {
            fetch: function () {
                var deferred = $q.defer();

                if(forecasts) {
                    deferred.resolve(forecasts);
                } else {
                    $http.get(apiUrl + '/api/forecasts').then(function (res) {
                        forecasts = res.data;
                        deferred.resolve(forecasts);
                    });
                }

                return deferred.promise;
            },
            getOne: function (regionId) {
                return $q.when(this.fetch()).then(function () {
                    var region = _.find(forecasts.features, {id: regionId});

                    return $http.get(apiUrl + region.properties.forecastUrl).then(function (res) {
                        return res.data;
                    });
                });
            },
            getDangerIconUrl: function(regionId) {
                var region = _.find(forecasts.features, {id: regionId});
                
                return AC_API_ROOT_URL + region.properties.dangerIconUrl
            }
        };
    }]);
angular.module('acComponents.services')
  .factory('acFormUtils', function() {

    var inputDefault = {
      getDTO: function (){
        return this.value;
      },
      validate: function(){
        return true;
      },
      reset: function () {
        this.value = null;
      },
      isCompleted: function () {
        return !_.isEmpty(this.value);
      },
      getDisplayObject: function(){
        return {
          prompt: this.prompt,
          order: (this.order)?this.order:50,
          type: this.type
        }
      }
    };

    var inputTypes = {
      checkbox: {
        getDTO: function (){
          return this.options;
        },
        validate: function(){
          if (angular.isDefined(this.limit)) {
            var noOfSelected = this.getNumberSelected();

            return noOfSelected <= this.limit;
          }

          return true;
        },
        reset: function () {
          var options = this.options;
          _.forEach(this.options, function (option, key) {
            options[key] = false;
          });
        },
        isCompleted: function () {
          var noOfSelected = this.getNumberSelected();

          return noOfSelected > 0;
        },
        getNumberSelected: function () {
          return _.reduce(this.options, function(total, option){
            if (option){
              total++;
            }
            return total;
          }, 0);

        },
        getDisplayObject: inputDefault.getDisplayObject
      },
      number:{
        getDTO: function (){
          return this.value;
        },
        validate: function(){
          return (this.value == null) || parseInt(this.value) >= this.options.min && parseInt(this.value) <= this.options.max;
        },
        reset: inputDefault.reset,
        isCompleted: inputDefault.isCompleted,
        getDisplayObject: inputDefault.getDisplayObject
      },
      dropdown: inputDefault,
      textarea: inputDefault,
      radio: inputDefault,
      datetime: inputDefault
    };

    return {
      buildReport: buildReport,
      validateLocationString: validateLocation
    };

    function buildReport(fields) {
      if (!angular.isDefined(fields)) {
        throw new Error('Please provide fields');
      }

      _.forEach(fields, function (field) {
        _.assign(field, assignUtils(field));
      });

      return {
        fields: fields,
        getDTO: getDTO,
        validate: validateFields,
        reset: resetFields,
        isCompleted: isCompleted,
        mapDisplayResponse: mapDisplayResponse
      };

      function assignUtils(field) {
        return inputTypes[field.type];
      }

      function getDTO() {
        return _.reduce(fields, function (dtos, field, key) {
          dtos[key] = field.getDTO();
          return dtos;
        }, {});
      }

      function validateFields() {
        return _.reduce(fields, function (errors, field, key) {
          var err = field.validate();
          if (err) {
            errors[key].push(err);
          }

          return errors;
        });
      }

      function resetFields() {
        _.invoke(fields, 'reset');
      }

      function isCompleted () {
        var total = _.reduce(fields, function (acc, field, key) {
          acc += field.isCompleted() ? 1 : 0;

          return acc;
        }, 0);

        return total > 0;
      }

      function mapDisplayResponse(ob) {
        if (_.isEmpty(ob)) return;

        var merged = _.reduce(ob, function (results, value, key) {
          if (_.isUndefined(results[key]) && value) {
            results[key] = {};
          }

          if (value && !_.isEmpty(parseValue(value))) {
            results[key] = (fields[key])?fields[key].getDisplayObject():{};
            results[key].value = parseValue(value);
          }

          return results;
        }, {});

        return _.sortBy(_.values(merged), 'order');
      }

      function parseValue(field) {
        if (_.isPlainObject(field)) {
          return _.reduce(field, function (array, item, key) {
            if (item) {
              array.push(key);
            }
            return array;
          }, [])
        } else {
          return field;
        }
      };
    }

    function validateLocation (locationString) {
      try {

        if (locationString.indexOf(',') === -1) {
          return false;
        }

        var latLng = locationString.split(',');

        if (latLng.length !== 2) {
          return false;
        }

        var location = L.latLng(latLng[0], latLng[1]);

        return angular.isNumber(location.lat) && angular.isNumber(location.lng);

      } catch (e) {
        return false;
      }
    }

  });

angular.module('acComponents.services')
    .factory('acImageCache', ["$http", function($http) {
        return {
            cache: function (images) {
                images.forEach(function (i) {
                    $http.get(i);
                });
            }
        };
    }]);
angular.module('acComponents.services')
  .service('acIncidentReportData', ["acFormUtils", function(acFormUtils) {

    var fields = {

      groupActivity: {
        type: 'checkbox',
        prompt: 'Activity:',
        options: {
          'Snowmobiling': false,
          'Skiing': false,
          'Climbing/Mountaineering': false,
          'Hiking/Scrambling': false,
          'Snowshoeing': false,
          'Tobogganing': false,
          'Other': false
        },
        inline: true,
        helpText: 'If other, please describe in Incident Description.',
        order: 1
      },

      groupSize: {
        type: 'number',
        prompt: 'Number of people in the group:',
        options: {
          'min': 0,
          'max': 100
        },
        value: null,
        errorMessage: 'Number between 0 and 100 please.',
        order: 2
      },

      numberFullyBuried: {
        type: 'number',
        prompt: 'Number of people fully buried:',
        options: {
          'min': 0,
          'max': 100
        },
        value: null,
        errorMessage: 'Number between 0 and 100 please.',
        order: 3
      },

      numberPartlyBuriedImpairedBreathing: {
        type: 'number',
        prompt: 'Number of people partly buried, breathing impaired:',
        options: {
          'min': 0,
          'max': 100
        },
        value: null,
        errorMessage: 'Number between 0 and 100 please.',
        order: 4
      },

      numberPartlyBuriedAbleBreathing: {
        type: 'number',
        prompt: 'Number of people partly buried, able to breathe normally:',
        options: {
          'min': 0,
          'max': 100
        },
        value: null,
        errorMessage: 'Number between 0 and 100 please.',
        order: 5
      },

      numberCaughtOnly: {
        type: 'number',
        prompt: 'Number of people caught and not buried:',
        options: {
          'min': 0,
          'max': 100
        },
        value: null,
        errorMessage: 'Number between 0 and 100 please.',
        order: 6
      },

      numberPeopleInjured: {
        type: 'number',
        prompt: 'Number of people caught only and not fully or partly buried:',
        options: {
          'min': 0,
          'max': 400
        },
        value: null,
        errorMessage: 'Number between 0 and 400 please.',
        order: 7
      },

      terrainShapeTriggerPoint: {
        type: 'radio',
        inline: true,
        prompt: 'Terrain shape at Trigger Point:',
        options: ['Convex', 'Planar', 'Concave', 'Unsupported'],
        value: null,
        helpText: 'Convex: a roll. Concave: bowl-shaped. Planar: smooth with no significant convexities or concavities. Unsupported: a slope that drops off abruptly at the bottom.',
        order: 8
      },

      snowDepthTriggerPoint: {
        type: 'radio',
        inline: true,
        prompt: 'Snow depth at Trigger Point:',
        options: ['Shallow', 'Deep', 'Average', 'Variable'],
        helpText: 'The depth of the snowpack compared to the average conditions in the area. Shallow: shallower than average. Deep: deeper than average. Average: about the same as everywhere else. Variable: depth varies significantly in the place where the avalanche started.',
        value: null,
        order: 9
      },

      terrainTrap: {
        type: 'checkbox',
        prompt: 'Terrain Trap:',
        options: {
          'No obvious terrain trap': false,
          'Gully or depression': false,
          'Slope transition or bench': false,
          'Trees': false,
          'Cliff': false
        },
        inline: true,
        helpText: 'Terrain traps are features that increase the consequences of an avalanche.',
        order: 10
      },

      incidentDescription: {
        prompt: 'Incident Description:',
        type: 'textarea',
        value: null,
        helpText: 'No names and no judging please.',
        guidelines: 'http://www.avalanche.ca/fxresources/Submissions+Guidelines.pdf',
        order: 11
      }
    };

    return acFormUtils.buildReport(fields);
  }]);

angular.module('acComponents.services')
    .factory('acObservation', ["$http", "AC_API_ROOT_URL", function ($http, AC_API_ROOT_URL) {
        var endpointUrl = AC_API_ROOT_URL + '/api/min/observations';

        return {
            byPeriod: function (period) {
                var opt = {params: {last: period || '2:days', client: 'web'}};

                return $http.get(endpointUrl, opt).then(function (res) {
                    return res.data;
                });
            },
            getOne: function(obid, format) {
                var format = '.'+format || '';
                var obUrl = endpointUrl + '/' + obid + format;

                return $http.get(obUrl).then(function (res) {
                    return res.data;
                });
            }
        };
    }]);

angular.module('acComponents.services')
    .service('acQuickReportData', function() {
        this.avalancheConditions = {
            'slab': false,
            'sound': false,
            'snow': false,
            'temp': false
        };

        this.ridingConditions = {
            ridingQuality: {
                prompt: 'Riding quality was:',
                type: 'single',
                options: ['Amazing', 'Good', 'OK', 'Terrible'],
                selected: null
            },

            snowConditions: {
                type: 'multiple',
                prompt: 'Snow conditions were:',
                options: {
                    'Crusty': false,
                    'Powder': false,
                    'Deep powder': false,
                    'Wet': false,
                    'Heavy': false,
                    'Wind affected': false,
                    'Hard': false
                }
            },

            rideType: {
                type: 'multiple',
                prompt: 'We rode:',
                options: {
                    'Mellow slopes': false,
                    'Steep slopes': false,
                    'Convex slopes': false,
                    'Sunny slopes': false,
                    'Cut-blocks': false,
                    'Open trees': false,
                    'Dense trees': false,
                    'Alpine slopes': false
                }
            },

            stayedAway: {
                type: 'multiple',
                prompt: 'We stayed away from:',
                options: {
                    'Steep slopes': false,
                    'Convex slopes': false,
                    'Sunny slopes': false,
                    'Cut-blocks': false,
                    'Open trees': false,
                    'Alpine slopes': false
                }
            },

            weather: {
                type: 'multiple',
                prompt: 'The day was:',
                options: {
                    'Stormy': false,
                    'Windy': false,
                    'Sunny': false,
                    'Cold': false,
                    'Warm': false,
                    'Cloudy': false,
                    'Foggy': false,
                    'Wet': false
                }
            }
        };


        // this function is different from the other isCompleted functions because we had to preserve the form of the service
        // in order to keep the functionality of the mobile app.
        this.isCompleted = function (fields) {

          var avalancheConditionsCompleted = checkedOption(fields.avalancheConditions);

          var ridingConditionsCompleted = _.reduce(fields.ridingConditions, function (total, item, key) {
            if (item.type === 'single' && !_.isEmpty(item.selected)) {
              total++;
            } else if (item.type === 'multiple') {
              var itemCompleted = checkedOption(item.options);

              if (itemCompleted > 0) {
                total++;
              }
            }

            return total;
          }, 0);

          var commentCompleted = !_.isEmpty(fields.comment) ? 1 : 0;

          return avalancheConditionsCompleted + ridingConditionsCompleted + commentCompleted > 0;

          function checkedOption (collection) {
            return _.reduce(collection, function (total, value) {
              return total + value ? 1 : 0;
            }, 0);
          }
        };
  }
    );

angular.module('acComponents.services')
  .factory('acReportData', ["acQuickReportData", "acAvalancheReportData", "acSnowpackReportData", "acWeatherReportData", "acIncidentReportData", function(acQuickReportData, acAvalancheReportData, acSnowpackReportData, acWeatherReportData, acIncidentReportData) {

    return {
      quick: acQuickReportData,
      avalanche: acAvalancheReportData,
      snowpack: acSnowpackReportData,
      weather: acWeatherReportData,
      incident: acIncidentReportData
    };

  }]);

angular.module('acComponents.services')
  .factory('acSnowpackReportData', ["acFormUtils", function(acFormUtils) {

    var fields = {

      snowpackObsType: {
        type: 'radio',
        prompt: 'Is this a point observation or a summary of your day?',
        options: ['Point Observation', 'Summary'],
        inline: true,
        value: null,
        helpText: 'Please add additional information about the snowpack, especially notes about weak layer, how the snow varied by aspect/elevation, and details of any slope testing performed.',
        order: 1
      },

      snowpackSiteElevation: {
        type: 'number',
        prompt: 'Snowpack Site Elevation (metres above sea level)',
        options: {
          min: 0,
          max: 4000
        },
        value: null,
        errorMessage: 'Number between 0 and 4000 please.',
        order: 2
      },

      snowpackSiteElevationBand: {
        type: 'radio',
        prompt: 'Snowpack Site Elevation Band',
        options: ['Alpine', 'Treeline', 'Below Treeline'],
        inline: true,
        value: null,
        order: 3
      },

      snowpackSiteAspect: {
        type: 'radio',
        prompt: 'Snowpack Site Aspect',
        options: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
        value: null,
        inline: true,
        order: 4
      },

      snowpackDepth: {
        type: 'number',
        prompt: 'Snowpack Depth (centimetres)',
        options: {
          min: 0,
          max: 10000
        },
        helpText:'Total height of snow in centimetres. Averaged if this is a summary.',
        value: null,
        errorMessage: 'Number between 0 and 10000 please.',
        order: 5
      },

      snowpackWhumpfingObserved:{
        type: 'radio',
        prompt: 'Did you observe whumpfing?',
        options: ['Yes', 'No'],
        inline: true,
        value: null,
        helpText: 'A whumpf is a rapid settlement of the snowpack caused by the collapse of a weak layer. It is accompanied by an audible noise.',
        order: 6
      },

      snowpackCrackingObserved:{
        type: 'radio',
        prompt: 'Did you observe cracking?',
        options: ['Yes', 'No'],
        inline: true,
        value: null,
        helpText: 'Cracking is shooting cracks radiating more than a couple of metres from your sled or skis.',
        order: 7
      },

      snowpackSurfaceCondition: {
        type: 'checkbox',
        prompt: 'Surface condition',
        options: {
          'New Snow': false,
          'Crust': false,
          'Surface Hoar': false,
          'Facets': false,
          'Corn': false,
          'Variable': false
        },
        inline: true,
        order: 8
      },

      snowpackFootPenetration: {
        type: 'number',
        prompt: 'Foot Penetration (centimeters)',
        options: {
          min: 0,
          max: 200
        },
        helpText:'How far you sink into the snow when standing on one fully-weighted foot.',
        value: null,
        errorMessage: 'Number between 0 and 200 please.',
        order: 9
      },

      snowpackSkiPenetration: {
        type: 'number',
        prompt: 'Ski Penetration (centimeters)',
        options: {
          min: 0,
          max: 200
        },
        helpText:'How far  you sink into the snow when standing on one fully-weighted ski.',
        value: null,
        errorMessage: 'Number between 0 and 200 please.',
        order: 10
      },

      snowpackSledPenetration: {
        type: 'number',
        prompt: 'Sled Penetration (centimeters)',
        options: {
          min: 0,
          max: 200
        },
        helpText:'The depth a sled sinks into the snow after stopping slowly on level terrain.',
        value: null,
        errorMessage: 'Number between 0 and 200 please.',
        order: 11
      },

      snowpackTestInitiation: {
        type: 'radio',
        prompt: 'Snowpack Test Result',
        options: ['None', 'Very Easy', 'Easy', 'Moderate', 'Hard'],
        helpText: 'Average if you did a number of tests.',
        value: null,
        inline: true,
        order: 12
      },

      snowpackTestFracture: {
        type: 'radio',
        prompt: 'Snowpack Test Fracture Character',
        options: ['Sudden ("Pop" or "Drop")', 'Resistant', 'Uneven break'],
        helpText: 'Average if you did a number of tests. Describe further in comments if variable results.',
        value: null,
        inline: true,
        order: 13
      },

      snowpackTestFailure: {
        type: 'number',
        prompt: 'Snowpack Test Failure Depth',
        options: {
          min: 0,
          max: 200
        },
        helpText:'Depth below the surface that failure occurred.',
        value: null,
        errorMessage: 'Number between 0 and 200 please.',
        order: 14
      },

      snowpackObsComment: {
        type: 'textarea',
        prompt: 'Snowpack Observation Comment',
        value: null,
        order: 15
      }
    };

    return acFormUtils.buildReport(fields);

  }]);

angular.module('acComponents.services')
    .factory('acSubmission', ["$q", "$http", "AC_API_ROOT_URL", function ($q, $http, AC_API_ROOT_URL) {
        var endpointUrl = AC_API_ROOT_URL + '/api/min/submissions';
        var sizeLimit = 25000000;
        var allowedMimeTypes = ['image/png', 'image/jpeg'];
        var fileViolationErrorMsg = 'Invalid file! Files have to be smaller than 25 MB and of type: ' + allowedMimeTypes.join(', ');

        function fileIsValid(file){
            return file.size < sizeLimit && allowedMimeTypes.indexOf(file.type) !== -1;
        }

        function fileAreValid(files){
            return _.reduce(files, function (memo, file) {
                return memo && fileIsValid(file);
            }, true);
        }

        function prepareData(reportData) {
            var deferred = $q.defer();

            if(fileAreValid(reportData.files)){
                var formData =  _.reduce(reportData, function (data, value, key) {
                    if(key === 'files') {
                        _.forEach(value, function(file, counter) {
                            data.append('file' + counter, file, file.name);
                        });
                    } else if(_.isPlainObject(value) || _.isArray(value)) {
                        data.append(key, JSON.stringify(value));
                    } else if(key === 'datetime') {
                        data.append(key, moment(value, 'YYYY-MM-DD hh:mm A').format());
                    } else if(_.isString(value)) {
                        data.append(key, value);
                    }

                    return data;
                }, new FormData());

                deferred.resolve(formData);
            } else {
                deferred.reject(fileViolationErrorMsg);
            }

            return deferred.promise;
        }

        return {
            submit: function (submission, token) {
                return prepareData(submission).then(function (formData) {
                    return $http.post(endpointUrl, formData, {
                        transformRequest: angular.identity,
                        headers: {
                            'Content-Type': undefined,
                            'Authorization': 'Bearer ' + token
                        }
                    });
                });
            },
            byPeriod: function (period) {
                var opt = {params: {period: period || '2:days'}};

                return $http.get(endpointUrl, opt).then(function (res) {
                    return res.data;
                });
            },
            getOne: function(obid, format) {
                var opt = {params: {client: 'web'}};
                var format = '.'+format || '';
                var obUrl = endpointUrl + obid + format;
                var obIdUrl = endpointUrl + '/' + obid;

                return $http.get(obIdUrl, opt).then(function (res) {
                    return res.data;
                });
            }
        };
    }]);

angular.module('acComponents.services')
  .factory('acWeatherReportData', ["acFormUtils", function(acFormUtils) {
    var fields = {
      skyCondition: {
        type: 'checkbox',
        prompt: 'Cloud Cover:',
        options: {
          'Clear': false,
          'Few clouds (<2/8)': false,
          'Scattered clouds (2/8-4/8)': false,
          'Broken clouds (5/8-7/8)': false,
          'Overcast (8/8)': false,
          'Fog': false
        },
        inline: true,
        helpText: 'Values expressed in eighths refer to the proportion of the sky that was covered with clouds. E.g. 2/8 refers to a sky approximately one quarter covered with cloud.',
        order: 1
      },

      precipitationType: {
        type: 'radio',
        prompt: 'Precipitation Type:',
        options: ['Snow', 'Rain', 'None'],
        value: null,
        inline: true,
        order: 2
      },

      snowfallRate: {
        type: 'number',
        prompt: 'Snowfall Rate (cm/hour):',
        options: {
          min: 1,
          max: 20
        },
        value: null,
        helpText: 'If there was no snow, please leave this field blank.',
        errorMessage: 'Number between 1 and 20 please.',
        order: 3
      },

      rainfallRate: {
        type: 'radio',
        prompt: 'Rainfall rate:',
        options: ['Drizzle', 'Showers', 'Raining', 'Pouring'],
        value: null,
        inline: true,
        helpText: 'If there was no rain, please leave this field blank.',
        order: 4
      },

      temperature: {
        type: 'number',
        prompt: 'Temperature at time of observation (deg C):',
        options: {
          min: -50,
          max: 40
        },
        value: null,
        errorMessage: 'Number between -50 and 40 please.',
        order: 5
      },

      minTemp: {
        type: 'number',
        prompt: 'Minimum temperature in last 24 hours (deg C)',
        options: {
          'min': -50,
          'max': 30
        },
        value: null,
        errorMessage: 'Number between -50 and 30 please.',
        order: 6
      },

      maxTemp: {
        type: 'number',
        prompt: 'Maximum temperature in last 24 hours (deg C):',
        options: {
          min: -40,
          max: 40
        },
        value: null,
        errorMessage: 'Number between -40 and 40 please.',
        order: 7
      },

      temperatureTrend: {
        type: 'radio',
        prompt: 'Temperature Trend:',
        options: ['Falling', 'Steady', 'Rising'],
        value: null,
        inline: true,
        helpText: 'Describe how the temperature changed in the last 3 hours.',
        order: 8
      },

      newSnow24Hours: {
        type: 'number',
        prompt: 'Amount of new snow in last 24 hours (centimetres):',
        options: {
          min: 0,
          max: 100
        },
        value: null,
        errorMessage: 'Number between 0 and 100 please.',
        order: 9
      },

      precipitation24Hours: {
        type: 'number',
        prompt: 'Total rain and snow combined in last 24 hours (millimetres):',
        options: {
          min: 0,
          max: 100
        },
        value: null,
        errorMessage: 'Number between 0 and 100 please.',
        order: 10
      },

      stormSnowAmount: {
        type: 'number',
        prompt: 'Total snow from the most recent storm (cm):',
        options: {
          min: 0,
          max: 300
        },
        value: null,
        helpText: 'Please enter the amount of snow that has fallen during the current storm cycle. You can specify a storm start date to describe the time period over which this snow fell.',
        errorMessage: 'Number between 0 and 300 please.',
        order: 11
      },

      stormStartDate: {
        type: 'datetime',
        prompt: 'Storm Start Date',
        value: null,
        helpText: 'The date on which the most recent storm started. Leave blank if there has not been a recent storm.',
        order: 12
      },

      windSpeed: {
        type: 'dropdown',
        prompt: 'Wind Speed',
        options: ['Calm', 'Light (1-25 km/h)', 'Moderate (26-40 km/h)', 'Strong (41-60 km/h)', 'Extreme (>60 km/h)'],
        value: null,
        helpText: 'Calm: smoke rises. Light: flags and twigs move. Moderate: snow begins to drift. Strong: whole tress in motion. Extreme: difficulty walking.',
        order: 13
      },

      windDirection: {
        type: 'radio',
        prompt: 'Wind Direction',
        options: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
        inline: true,
        value: null,
        order: 14
      },

      blowingSnow: {
        type: 'radio',
        prompt: 'Blowing Snow',
        options: ['None', 'Light', 'Moderate', 'Intense'],
        inline: true,
        helpText: 'How much snow is blowing at ridge crest elevation. Light: localized snow drifting. Moderate: a plume of snow is visible. Intense: a large plume moving snow well down the slope.',
        order: 15
      },

      weatherObsComment: {
        type: 'textarea',
        prompt: 'Weather Observation Comment',
        value: null,
        order: 16
      }
    };

    return acFormUtils.buildReport(fields);

  }]);

angular.module("acComponents.templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("allmin-icon.html","<svg width=\"28px\" height=\"28px\" viewbox=\"0 0 28 28\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:sketch=\"http://www.bohemiancoding.com/sketch/ns\"><title>all_min</title><g id=\"Styleguide\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\" sketch:type=\"MSPage\"><g id=\"02_01_Second-proposal-#2\" sketch:type=\"MSArtboardGroup\" transform=\"translate(-30.000000, -101.000000)\" stroke=\"#FFFFFF\"><g id=\"all_min\" sketch:type=\"MSLayerGroup\" transform=\"translate(31.000000, 102.000000)\"><circle id=\"Oval-6\" fill=\"#FFFFFF\" sketch:type=\"MSShapeGroup\" cx=\"13\" cy=\"13\" r=\"13\"></circle><path id=\"Oval-5\" d=\"M20.6424365,23.5174622 C18.4973383,25.078868 15.8562401,26 13,26 C10.1408573,26 7.49729401,25.0769949 5.35102528,23.5126999 C5.35616485,23.5157039 5.35879172,23.5172209 5.35879172,23.5172209 L12.9999995,13 L20.6412083,23.5172209 C20.6412083,23.5172209 20.6416198,23.5173052 20.6424365,23.5174622 Z\" fill=\"#F44336\" sketch:type=\"MSShapeGroup\"></path><path id=\"Oval-1\" d=\"M13,0 C7.1843333,0 2.26060446,3.81883989 0.599648246,9.08568486 C0.623290506,9.01855468 0.636265288,8.98277907 0.636265288,8.98277907 L12.9999995,13 L13,0 Z\" fill=\"#03A9F4\" sketch:type=\"MSShapeGroup\"></path><path id=\"Oval-1\" d=\"M13,0 C18.8156667,0 23.7393955,3.81883989 25.4003518,9.08568486 C25.3767095,9.01855468 25.3637347,8.98277907 25.3637347,8.98277907 L13.0000005,13 L13,0 Z\" fill=\"#3F51B5\" sketch:type=\"MSShapeGroup\"></path><path id=\"Oval-3\" d=\"M7.63867216,23.5467443 C10.8878189,21.1834812 13.0000005,17.3516752 13.0000005,13.0265428 C13.0000005,11.6211191 12.7769788,10.2677848 12.3643955,9 L12.3637352,9.00932187 L0,13.0265428 L7.64120875,23.5437637 C7.64120875,23.5437637 7.64035873,23.5447686 7.63867216,23.5467443 Z\" fill=\"#4CAF50\" sketch:type=\"MSShapeGroup\" transform=\"translate(6.500000, 16.273372) scale(-1, 1) translate(-6.500000, -16.273372) \"></path><path id=\"Oval-3\" d=\"M20.6386717,23.5202015 C23.8878184,21.1569384 26,17.3251324 26,13 C26,11.5945763 25.7769784,10.241242 25.364395,8.97345721 L25.3637347,8.98277907 L12.9999995,13 L20.6412083,23.5172209 C20.6412083,23.5172209 20.6403583,23.5182258 20.6386717,23.5202015 Z\" fill=\"#FFC107\" sketch:type=\"MSShapeGroup\"></path></g></g></g></svg>");
$templateCache.put("danger-icon.html","<div class=\"danger-icon\"><svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" viewBox=\"398.5 12.1 555 560\" enable-background=\"new 398.5 12.1 555 560\" xml:space=\"preserve\"><polygon id=\"alp\" points=\"747.7,218.1 623.1,197.6 678.8,109.8\"></polygon><polygon id=\"tln\" points=\"794.2,291 542.8,323.6 616.7,207.4 755.5,230.3\"></polygon><polygon id=\"btl\" points=\"858.3,391.8 499.4,391.8 535.1,335.5 800.6,301.1\"></polygon></svg><span>FORECAST</span></div>");
$templateCache.put("drawer.html","<div class=\"ac-drawer\"><a ng-click=\"drawer.right.visible = false\" ng-if=\"drawerPosition === \'right\'\" class=\"ac-drawer-close visible-xs\"><i class=\"fa fa-close fa-lg\"></i></a><div class=\"ac-drawer-tools\"><ul><li ng-if=\"drawerPosition === \'right\'\" ng-click=\"toggleForecast()\" ng-class=\"{on: drawer.right.visible &amp;&amp; drawer.right.enabled}\" style=\"margin-bottom: 50px;\"><div ac-danger-icon=\"ac-danger-icon\" style=\"height: 60px; width:60px;\"></div></li><li ng-if=\"drawerPosition === \'left\'\" ng-click=\"goToSubmitReport()\" class=\"ac-submit-report-tab on\"><i class=\"fa fa-plus fa-2x\"></i><i class=\"fa fa-tasks fa-inverse fa-2x\"></i><span>New report</span></li><li ng-if=\"drawerPosition === \'left\'\" class=\"ac-filters ac-min-filters\"><ul ng-init=\"expandedMin = false\" ng-class=\"{opened: expandedMin}\" class=\"list-inline\"><li ng-click=\"expandedMin = !expandedMin\" class=\"ac-minfilter-button\"><i class=\"fa fa-map-marker fa-inverse fa-2x\"></i><span>MIN Filter</span></li><li ng-repeat=\"minFilter in minFilters\" ng-if=\"expandedMin\" ng-click=\"toggleFilter(\'minFilter:\'+ minFilter)\" ng-class=\"{on: getMinFilters(minFilter)}\"><div ac-allmin-icon=\"ac-allmin-icon\" ng-if=\"minFilter === \'all min\'\" class=\"report-allmin\"></div><i ng-class=\"\'report-\'+ minFilter\" ng-if=\"minFilter !== \'all min\'\" class=\"fa fa-map-marker fa-inverse fa-2x\"></i><span>{{ minFilter }}</span></li></ul></li><li ng-if=\"drawerPosition === \'left\'\" class=\"ac-filters ac-date-filters\"><ul ng-class=\"{opened: expandedDate}\" class=\"list-inline\"><li ng-click=\"toggleDateFilters()\" class=\"on\"><i class=\"fa fa-calendar fa-inverse fa-2x\"></i><span>{{ filters.obsPeriod }}</span></li><li ng-repeat=\"dateFilter in dateFilters\" ng-if=\"expandedDate\" ng-click=\"toggleFilter(\'obsPeriod:\'+dateFilter);\" ng-class=\"{hidden: filters.obsPeriod === dateFilter}\"><i class=\"fa fa-calendar fa-inverse fa-2x\"></i><span>{{ dateFilter }}</span></li></ul></li></ul></div><div ng-transclude=\"ng-transclude\" class=\"ac-drawer-body\"></div></div>");
$templateCache.put("forecast-mini.html","<div class=\"panel\"><div ng-show=\"forecast.externalUrl\" style=\"min-height: 500px;\" class=\"panel-body\"><div class=\"row\"><div class=\"col-xs-12\"><h3 class=\"ac-forecast-region\">{{ forecast.name }}</h3></div></div><div class=\"row\"><div class=\"col-xs-12\"><p>Avalanche information for this region is available &nbsp;<a ng-href=\"{{forecast.externalUrl}}\" target=\"_blank\"><i class=\"fa fa-external-link\">here.</i></a></p></div></div></div><div ng-show=\"forecast.parksUrl\" style=\"min-height: 500px;\" class=\"panel-body\"><div class=\"row\"><div class=\"col-xs-12\"><h3 class=\"ac-forecast-region\">{{ forecast.name }}</h3></div></div><div class=\"row\"><div class=\"col-xs-12\"><p>Avalanche information for this region is available &nbsp;<a ng-href=\"{{forecast.parksUrl}}\" target=\"_blank\"><i class=\"fa fa-external-link\">here.</i></a></p></div></div></div><div ng-hide=\"forecast.externalUrl || forecast.parksUrl\" class=\"panel-body ac-forecast-mini-body\"><div class=\"row\"><div class=\"col-xs-6\"><h4 class=\"ac-forecast-region\">{{ forecast.bulletinTitle | acNormalizeForecastTitle }}</h4></div><div ng-if=\"forecast.region == &quot;kananaskis&quot;\" class=\"col-xs-6\"><a target=\"_blank\" href=\"\" class=\"pull-right\"><img style=\"width:75px;\" src=\"http://www.avalanche.ca/assets/images/kananaskis.jpg\"/></a></div><div ng-if=\"!(forecast.region == &quot;kananaskis&quot;)\" class=\"col-xs-6\"><a target=\"_blank\" href=\"{{sponsor.getText(&quot;sponsor.url&quot;)}}\" class=\"pull-right\"><img src=\"{{sponsor.getText(&quot;sponsor.image-229&quot;)}}\"/></a></div></div><div class=\"row ac-forecast-dates\"><div class=\"col-md-6\"><dl><dd class=\"small\"><strong class=\"ac-text-primary\">DATE ISSUED</strong></dd><dt class=\"small\"><span class=\"ac-text-default\">{{ forecast.dateIssued | date:\'EEEE MMMM d, y h:mm a\'  | uppercase }}</span></dt></dl></div><div class=\"col-md-6\"><dl><dd class=\"small\"><strong class=\"ac-text-primary\">VALID UNTIL</strong></dd><dt class=\"small\"><span class=\"ac-text-default\">{{ forecast.validUntil | date:\'EEEE MMMM d, y h:mm a\' | uppercase }}</span></dt></dl></div></div><div class=\"row\"><div class=\"col-xs-12\"><p class=\"ac-forecast-highlights\"><strong ng-bind-html=\"forecast.highlights\"></strong></p></div></div><div class=\"row\"><div style=\"padding-right:0\" class=\"col-xs-12 observation-tabs\"><ul role=\"tablist\" style=\"text-transform: uppercase;\" class=\"nav nav-pills\"><li class=\"active\"><a href=\"\" role=\"tab\" data-target=\"#forecast\" data-toggle=\"tab\">Forecast</a></li><li><a href=\"\" role=\"tab\" data-target=\"#problems\" data-toggle=\"tab\">Problems</a></li><li><a href=\"\" role=\"tab\" data-target=\"#details\" data-toggle=\"tab\">Details</a></li><li><a href=\"/forecasts/{{forecast.region}}\" role=\"tab\">Full Page</a></li><li><a href=\"/weather\" role=\"tab\">Weather</a></li></ul><div class=\"tab-content\"><div id=\"forecast\" class=\"tab-pane active\"><div class=\"row\"><div class=\"col-xs-12\"><div class=\"panel panel-primary\"><div class=\"panel-heading\">{{ forecast.dangerRatings[0].date | dateUtc:\'dddd\' }}</div><div class=\"panel-body ac-forecast-nowcast\"><img ng-show=\"forecast.region\" ng-src=\"{{forecast.region &amp;&amp; apiUrl+\'/api/forecasts/\' + forecast.region  + \'/nowcast.svg\' || \'\'}}\" class=\"ac-nowcast\"/></div><table class=\"table table-condensed ac-forecast-days\"><thead class=\"ac-thead-dark\"><tr><th></th><th>{{ forecast.dangerRatings[1].date | dateUtc:\'dddd\' }}</th><th>{{ forecast.dangerRatings[2].date | dateUtc:\'dddd\' }}</th></tr></thead><tbody><tr><td class=\"ac-veg-zone--alp\"><strong>Alpine</strong></td><td class=\"ac-danger-rating--{{ forecast.dangerRatings[1].dangerRating.alp.split(\':\')[1].toLowerCase()}}\"><strong>{{ forecast.dangerRatings[1].dangerRating.alp.replace(\':\', \' \') }}</strong></td><td class=\"ac-danger-rating--{{ forecast.dangerRatings[2].dangerRating.alp.split(\':\')[1].toLowerCase()}}\"><strong>{{ forecast.dangerRatings[2].dangerRating.alp.replace(\':\', \' \') }}</strong></td></tr><tr><td class=\"ac-veg-zone--tln\"><strong>Treeline</strong></td><td class=\"ac-danger-rating--{{ forecast.dangerRatings[1].dangerRating.tln.split(\':\')[1].toLowerCase()}}\"><strong>{{ forecast.dangerRatings[1].dangerRating.tln.replace(\':\', \' \') }}</strong></td><td class=\"ac-danger-rating--{{ forecast.dangerRatings[2].dangerRating.tln.split(\':\')[1].toLowerCase()}}\"><strong>{{ forecast.dangerRatings[2].dangerRating.tln.replace(\':\', \' \') }}</strong></td></tr><tr><td class=\"ac-veg-zone--btl\"><strong>Below Treeline</strong></td><td class=\"ac-danger-rating--{{ forecast.dangerRatings[1].dangerRating.btl.split(\':\')[1].toLowerCase()}}\"><strong>{{ forecast.dangerRatings[1].dangerRating.btl.replace(\':\', \' \') }}</strong></td><td class=\"ac-danger-rating--{{ forecast.dangerRatings[2].dangerRating.btl.split(\':\')[1].toLowerCase()}}\"><strong>{{ forecast.dangerRatings[2].dangerRating.btl.replace(\':\', \' \') }}</strong></td></tr><tr><td><strong>Confidence:</strong></td><td colspan=\"2\"><span class=\"ac-text-default\">{{ forecast.confidence }}</span></td></tr></tbody></table><footer id=\"forecast-bulletin\" class=\"col-xs-12\"></footer><div class=\"panel-group\"><div class=\"panel panel-default first\"><h4 class=\"panel-title\"><a href=\"\" data-target=\"#collapseTwo\" data-parent=\"#accordion\" data-toggle=\"collapse\" class=\"collapsed\">{{dangerRating.getText(\'generic.title\')}}</a></h4><div id=\"collapseTwo\" class=\"collapse\"><div ng-bind-html=\"dangerRating.getStructuredText(\'generic.body\').asHtml(ctx)\" class=\"panel-body\"></div></div></div><div class=\"panel panel-default last\"><h4 class=\"panel-title\"><a href=\"\" data-target=\"#collapseOne\" data-parent=\"#accordion\" data-toggle=\"collapse\" class=\"collapsed\">{{disclaimer.getText(\'generic.title\')}}</a></h4><div id=\"collapseOne\" class=\"collapse\"><div ng-bind-html=\"disclaimer.getStructuredText(\'generic.body\').asHtml(ctx)\" class=\"panel-body\"></div></div></div></div></div></div></div></div><div id=\"problems\" class=\"tab-pane\"><div id=\"problemsAccordion\" class=\"panel-group\"><div ng-repeat=\"problem in forecast.problems\" class=\"panel panel-primary\"><div class=\"panel-heading\"><h4 class=\"panel-title\"><a href=\"\" data-target=\"#problem{{$index}}\" data-toggle=\"collapse\" data-parent=\"#problemsAccordion\">{{ problem.type }}<i class=\"fa fa-fw fa-level-down pull-right\"></i><small class=\"pull-right\">click to expand</small></a></h4></div><div id=\"problem{{$index}}\" class=\"panel-collapse collapse\"><div class=\"panel-body\"><div class=\"row\"><div class=\"col-md-6\"><div class=\"panel panel-default\"><div class=\"panel-heading\"><strong class=\"small\">What Elevations?</strong></div><div class=\"panel-body ac-problem-icon ac-problem-icon--elevations\"><img ng-src=\"{{problem.icons.elevations}}\" class=\"center-block\"/></div></div></div><div class=\"col-md-6\"><div class=\"panel panel-default\"><div class=\"panel-heading\"><strong class=\"small\">What Aspects?</strong></div><div class=\"panel-body ac-problem-icon ac-problem-icon--aspects\"><img ng-src=\"{{problem.icons.aspects}}\" class=\"center-block\"/></div></div></div></div><div class=\"row\"><div class=\"col-md-6\"><div class=\"panel panel-default\"><div class=\"panel-heading\"><strong class=\"small\">Chances of Avalanches?</strong></div><div class=\"panel-body ac-problem-icon ac-problem-icon--likelihood\"><img ng-src=\"{{problem.icons.likelihood}}\" class=\"center-block\"/></div></div></div><div class=\"col-md-6\"><div class=\"panel panel-default\"><div class=\"panel-heading\"><strong class=\"small\">Expected Size?</strong></div><div class=\"panel-body ac-problem-icon ac-problem-icon--expected-size\"><img ng-src=\"{{problem.icons.expectedSize}}\" class=\"center-block\"/></div></div></div></div><div class=\"row\"><div class=\"col-md-12\"><p ng-bind-html=\"problem.comment\" class=\"ac-problem narative\"></p><div class=\"panel panel-default ac-problem-travel-advice\"><div class=\"panel-heading\"><strong class=\"small\">Travel and Terrain Advice</strong></div><div class=\"panel-body\"><p ng-bind-html=\"problem.travelAndTerrainAdvice\"></p></div></div></div></div></div></div></div></div></div><div id=\"details\" class=\"tab-pane\"><div id=\"detailsAccordion\" class=\"panel-group\"><div class=\"panel panel-primary\"><div class=\"panel-heading\"><h4 class=\"panel-title\"><a href=\"\" data-target=\"#avalancheSummary\" data-toggle=\"collapse\" data-parent=\"#detailsAccordion\">Avalanche Summary<i class=\"fa fa-fw fa-level-down fa-lg pull-right\"></i><small class=\"pull-right\">click to expand</small></a></h4></div><div id=\"avalancheSummary\" class=\"panel-collapse collapse\"><div ng-bind-html=\"forecast.avalancheSummary\" class=\"panel-body\"></div></div></div><div class=\"panel panel-primary\"><div class=\"panel-heading\"><h4 class=\"panel-title\"><a href=\"\" data-target=\"#snowpackSummary\" data-toggle=\"collapse\" data-parent=\"#detailsAccordion\">Snowpack Summary<i class=\"fa fa-fw fa-level-down fa-lg pull-right\"></i><small class=\"pull-right\">click to expand</small></a></h4></div><div id=\"snowpackSummary\" class=\"panel-collapse collapse\"><div ng-bind-html=\"forecast.snowpackSummary\" class=\"panel-body\"></div></div></div><div class=\"panel panel-primary\"><div class=\"panel-heading\"><h4 class=\"panel-title\"><a href=\"\" data-target=\"#weatherForecast\" data-toggle=\"collapse\" data-parent=\"#detailsAccordion\">Weather Forecast<i class=\"fa fa-fw fa-level-down fa-lg pull-right\"></i><small class=\"pull-right\">click to expand</small></a></h4></div><div id=\"weatherForecast\" class=\"panel-collapse collapse\"><div ng-bind-html=\"forecast.weatherForecast\" class=\"panel-body\"></div></div></div></div></div></div></div></div></div></div>");
$templateCache.put("loading-indicator.html","<div class=\"ac-loading-indicator\"><div class=\"rect1\"></div><div class=\"rect2\"></div><div class=\"rect3\"></div><div class=\"rect4\"></div><div class=\"rect5\"></div></div>");
$templateCache.put("min-map-modal.html","<div class=\"modal-body\"><input type=\"button\" value=\"Save and close\" ng-click=\"save()\" class=\"btn btn-default save-button\"/><div ac-location-select=\"ac-location-select\" latlng=\"params.latlng\" style=\"height: 100%; width: 100%;\" ng-if=\"show\"></div></div>");
$templateCache.put("min-observation-drawer.html","<div class=\"panel\"><div class=\"panel-body\"><div class=\"row\"><div ng-click=\"closeDrawer()\" class=\"pull-right close-drawer\"><i class=\"fa fa-close\"></i></div><div class=\"col-sm-8 col-xs-12\"><h3>{{::sub.title}}</h3></div><div class=\"col-sm-3 col-xs-12\"><a target=\"_blank\" href=\"{{sponsor.getText(&quot;sponsor.url&quot;)}}\" class=\"pull-right\"><img src=\"{{sponsor.getText(&quot;sponsor.image-229&quot;)}}\"/></a></div></div><div class=\"row submission-header\"><div class=\"col-sm-12 section-label\"><i class=\"fa fa-clock-o\"></i><span>Submitted</span></div><div class=\"col-sm-12\"><p>By <span> {{::sub.user}} </span></p><p>On {{::sub.dateFormatted}}</p></div></div></div><div style=\"padding-right: 0\" class=\"panel-body\"><div class=\"row-fluid observation-tabs\"><ul role=\"tablist\" class=\"nav nav-pills\"><li ng-repeat=\"tab in reportTypes\" role=\"presentation\" ng-class=\"[hasReport(tab),{active: tab === sub.requested}]\"><a ng-click=\"changeTab(tab)\" style=\"text-transform: uppercase;\">{{::tab}}</a></li></ul></div><div class=\"row-fluid\"><div class=\"tab-content\"><div ng-repeat=\"tab in reportTypes\" role=\"tabpanel\" id=\"{{tab}}\" ng-class=\"{active: tab === sub.requested}\" class=\"tab-pane\"><div class=\"row-fluid section-label\"><i class=\"fa fa-info-circle\"></i><span>Information</span></div><div ng-repeat=\"ob in sub.obs\"><div ng-if=\"ob.obtype === sub.requested\" ng-repeat=\"item in activeTab\" class=\"submission-header\"><ul class=\"observation-information\"><li ng-if=\"item.type === \'number\' || item.type === \'radio\'|| item.type === \'dropdown\'\" class=\"observation-item\">{{::item.prompt}}<i class=\"fa fa-check\"></i><span class=\"value\">{{::item.value}}</span></li><li ng-if=\"item.type === \'checkbox\'\" class=\"observation-item\">{{::item.prompt}}<ul><li ng-repeat=\"op in item.value track by $index\"><i class=\"fa fa-check\"></i><span class=\"value\">{{op}}</span></li></ul></li><li ng-if=\"item.type === \'datetime\'\" class=\"observation-item\">{{::item.prompt}}<span>&nbsp; {{::item.value | dateformat}}</span></li></ul><div ng-if=\"item.type === \'textarea\'\" class=\"observation-item comments\"><div class=\"row-fluid section-label\"><i class=\"fa fa-comment\"></i><span>Comments</span></div><div class=\"row-fluid\"><div class=\"col-sm-12\">{{::item.value}}</div></div></div></div></div></div></div></div></div><div class=\"panel-body upload-n-share\"><div ng-if=\"sub.uploads.length &gt; 0\" class=\"row\"><div class=\"col-sm-12 section-label\"><i class=\"fa fa-camera\"></i><span>Uploads (click/tap to enlarge)</span></div><div class=\"col-sm-12\"><ul class=\"list-inline\"><li ng-repeat=\"url in sub.thumbs\"><a ng-href=\"{{::url}}\" target=\"_blank\"><img ng-src=\"{{::url}}\" width=\"75\" alt=\"{{::sub.title}}\"/></a></li></ul></div></div><div class=\"row\"><div class=\"col-sm-12 section-label\"><i class=\"fa fa-share-square-o\"></i><span>Share this report</span></div><div class=\"col-sm-12\"><div class=\"col-sm-12\"><ul class=\"list-inline\"><li><a ng-href=\"https://twitter.com/intent/tweet?status={{::sub.shareUrl}}\"><i class=\"fa fa-twitter fa-fw fa-lg\"></i></a></li><li><a ng-href=\"https://www.facebook.com/sharer/sharer.php?u={{::sub.shareUrl}}\"><i class=\"fa fa-facebook fa-fw fa-lg\"></i></a></li><li><a ng-href=\"https://plus.google.com/share?url={{::sub.shareUrl}}\"><i class=\"fa fa-google-plus fa-fw fa-lg\"></i></a></li></ul></div></div></div></div></div>");
$templateCache.put("min-report-form.html","<div class=\"min-form\"><form name=\"acMinForm\" ng-submit=\"submitForm()\" novalidate=\"novalidate\" ng-if=\"!report.subid\" role=\"form\" ac-submission-form-validator=\"ac-submission-form-validator\"><div class=\"form-fields col-xs-12 no-padding\"><div class=\"col-xs-12 col-md-4 form-left-column\"><div class=\"required-info clearfix\"><h2 class=\"form-subtitle\">Step 1. Required Info</h2><div class=\"required-info-data col-xs-12\"><div ng-class=\"{\'has-error\': !acMinForm.title.$valid &amp;&amp; acMinForm.title.$dirty }\" class=\"form-group\"><label for=\"title\">Name your report</label><input type=\"text\" name=\"title\" ng-model=\"report.title\" placeholder=\"e.g. Upper Raft River\" required=\"required\" class=\"form-control\"/></div><div ng-class=\"{\'has-error\': !acMinForm.datetime.$valid}\" class=\"form-group\"><label for=\"datetime\"> Submission date and time</label><input type=\"datetime\" name=\"datetime\" ng-model=\"report.datetime\" ac-datetime-picker=\"ac-datetime-picker\" class=\"form-control\"/></div><div ng-class=\"{\'has-error\': invalidLatLng}\" class=\"form-group\"><label for=\"latlng\"> Enter location by map</label><div ng-click=\"openMapModal()\" class=\"btn-map\"><i class=\"fa fa-map-o\"></i></div><label>or enter location by Lat Long</label><input type=\"text\" ng-class=\"{\'modified\': tempLatlngModified}\" name=\"tempLatlng\" ac-enter=\"saveLocation()\" ng-model=\"report.tempLatlng\" placeholder=\"e.g. 51.522, -188.883\" required=\"required\" class=\"form-control latlng\"/><div role=\"button\" ng-if=\"tempLatlngModified\" ng-click=\"saveLocation()\" class=\"save-location\"><i class=\"fa fa-map-marker\"></i></div><div ng-if=\"invalidLatLng\" class=\"error col-xs-12 no-padding\">Invalid coordinates format</div></div></div></div><div class=\"uploads\"><h2 class=\"form-subtitle\">Step 2. Uploads</h2><p>Add a photo (.jpg or .png) to help tell your story.</p><div class=\"form-group\"><div class=\"col-xs-12 no-padding btn-file\"><div class=\"col-xs-3 no-padding\"><span class=\"btn btn-default\">Browse</span></div><input type=\"text\" readonly=\"readonly\" placeholder=\".jpg or .png\" value=\"{{ report.files.length ? report.files.length + \' photos added\' : null}}\" class=\"col-xs-9 no-padding\"/><input type=\"file\" name=\"uploads\" file-model=\"report.files\" accept=\".png,.jpg,.jpeg\" multiple=\"multiple\"/></div></div></div></div><div class=\"col-xs-12 col-md-8 form-right-column\"><h2 id=\"top\" class=\"form-subtitle\">Step 3. Observations</h2><div class=\"announcement\">Add information on one, some, or all tabs, then click SUBMIT at the bottom.</div><tabset type=\"pills\" class=\"observation-tabs\"><!--Quick report--><tab ac-tab-style=\"{{getTabExtraClasses(\'quickReport\')}}\"><tab-heading class=\"tab-head\">Quick</tab-heading><div class=\"tab-text\">Use the Quick Report to quickly share information about your trip. You can create a comprehensive\nreport by adding more details in the Avalanche, Snowpack, Weather, and/or Incident tabs.</div><div class=\"fields-group\"><div ng-repeat=\"(item, ridingCondition) in report.obs.quickReport.ridingConditions\" class=\"field col-xs-12\"><h4 class=\"field-title col-xs-12 no-padding\"><strong>{{ ::ridingCondition.prompt }}</strong></h4><div class=\"options col-xs-12 col-md-4 col-md-push-8\"></div><div class=\"options col-xs-12 col-md-8 col-md-pull-4\"><div ng-if=\"ridingCondition.type==\'multiple\'\" ng-repeat=\"(option, enabled) in ridingCondition.options\" ng-class=\"{\'column-left\':$odd}\" class=\"checkbox col-xs-12 col-md-6 inline\"><label><input type=\"checkbox\" name=\"{{ ::item}}\" ng-model=\"ridingCondition.options[option]\"/>{{ ::option}}</label></div><div ng-if=\"ridingCondition.type==\'single\'\" ng-repeat=\"option in ridingCondition.options\" class=\"radio col-xs-12 col-md-6 inline\"><label><input type=\"radio\" name=\"{{ ::item}}\" ng-model=\"ridingCondition.selected\" ng-value=\"option\"/>{{ ::option}}</label></div></div></div><div class=\"field col-xs-12\"><h4 class=\"field-title col-xs-12 no-padding\"><strong>Avalanche conditions</strong></h4><div class=\"options col-xs-12 col-md-4 col-md-push-8\"></div><div class=\"options col-xs-12 col-md-8 col-md-pull-4\"><div class=\"checkbox col-xs-12\"><label><input type=\"checkbox\" name=\"slab\" ng-model=\"report.obs.quickReport.avalancheConditions.slab\"/>Slab avalanches today or yesterday.</label></div><div class=\"checkbox col-xs-12\"><label><input type=\"checkbox\" name=\"sound\" ng-model=\"report.obs.quickReport.avalancheConditions.sound\"/>Whumphing or drum-like sounds or shooting cracks.</label></div><div class=\"checkbox col-xs-12\"><label><input type=\"checkbox\" name=\"snow\" ng-model=\"report.obs.quickReport.avalancheConditions.snow\"/>30cm + of new snow, or significant drifitng, or rain in the last 48 hours.</label></div><div class=\"checkbox col-xs-12\"><label><input type=\"checkbox\" name=\"temp\" ng-model=\"report.obs.quickReport.avalancheConditions.temp\"/>Rapid temperature rise to near zero degrees or wet surface snow.</label></div></div></div><div class=\"field col-xs-12\"><h4 class=\"field-title col-xs-12 no-padding\"><strong>Comments</strong></h4><div class=\"options col-xs-12 col-md-4 col-md-push-8\"></div><div class=\"options col-xs-12 col-md-8 col-md-pull-4\"><div class=\"textarea col-xs-12\"><textarea rows=\"3\" name=\"comment\" ng-model=\"report.obs.quickReport.comment\" style=\"resize: vertical;\" class=\"form-control\"></textarea></div></div></div></div></tab><tab ng-repeat=\"(key, tab) in additionalFields\" ac-tab-style=\"{{getTabExtraClasses(key)}}\"><tab-heading class=\"tab-head\">{{ ::tab.name}}</tab-heading><div ng-bind-html=\"tab.text\" class=\"tab-text\"></div><div class=\"fields-group\"><div ng-repeat=\"(item, av) in report.obs[key].fields\" class=\"field col-xs-12\"><h4 class=\"field-title col-xs-12 no-padding\"><strong>{{ ::av.prompt }}</strong></h4><div class=\"options col-xs-12 col-md-4 col-md-push-8\"><div ng-if=\"av.helpText\" class=\"help-text\"><p><i class=\"fa fa-question-circle\"></i><span>{{ ::av.helpText}}</span></p><span ng-if=\"av.guidelines\"><a href=\"{{ ::av.guidelines}}\" target=\"_blank\">Submission guidelines</a></span></div></div><div class=\"options col-xs-12 col-md-8 col-md-pull-4\"><div ng-if=\"av.type==\'checkbox\'\" ng-repeat=\"(option, enabled) in av.options\" ng-class=\"{\'inline\':av.inline, \'column-left\':$odd}\" class=\"checkbox col-md-6 col-xs-12\"><label><input type=\"checkbox\" name=\"{{::item}}\" ng-model=\"av.options[option]\" ng-click=\"validate(item, av)\"/>{{ ::option}}</label></div><div ng-if=\"av.type==\'radio\'\" ng-repeat=\"option in av.options\" ng-class=\"{\'inline\':av.inline, \'column-left\':$odd}\" class=\"radio col-md-6 col-xs-12\"><label><input type=\"radio\" ng-model=\"report.obs[key].fields[item].value\" value=\"{{ ::option}}\"/>{{ ::option}}</label></div><div ng-if=\"av.type==\'number\'\" ng-class=\"{\'inline\':av.inline}\" class=\"number col-xs-12\"><label><input type=\"number\" name=\"{{::item}}\" placeholder=\"Number between {{ ::av.options.min}} and {{ ::av.options.max}}\" ng-model=\"report.obs[key].fields[item].value\" ng-blur=\"validate(item, av)\"/></label></div><div ng-if=\"av.type==\'dropdown\'\" ng-class=\"{\'inline\':av.inline, \'column-left\':$odd}\" class=\"select col-md-6 col-xs-12 no-padding\"><select ng-options=\"option for option in av.options\" ng-model=\"report.obs[key].fields[item].value\"><option value=\"\">Select option</option></select></div><div ng-if=\"av.type==\'textarea\'\" class=\"textarea col-xs-12\"><textarea rows=\"3\" ng-model=\"report.obs[key].fields[item].value\" class=\"form-control\"></textarea></div><div ng-if=\"av.type==\'datetime\'\" class=\"datetime-input col-xs-12\"><label for=\"datetime\"><input type=\"datetime\" ng-model=\"report.obs[key].fields[item].value\" ac-datetime-picker=\"ac-datetime-picker\" placeholder=\"Click to select date\"/></label></div><div ng-if=\"acMinForm[item].$invalid\" class=\"error col-xs-12 no-padding\">{{::av.errorMessage}}</div></div></div></div></tab></tabset><div class=\"return-to-top col-xs-12 no-padding\"><input type=\"button\" value=\"Back to top\" ng-click=\"scrollToTop()\" class=\"btn btn-default\"/></div></div></div><input type=\"button\" value=\"Back\" ng-click=\"goBack()\" class=\"btn btn-default\"/><div class=\"submit-btn\"><i ng-show=\"minsubmitting\" class=\"fa fa-fw fa-lg fa-spinner fa-spin\"></i><input type=\"submit\" id=\"submit\" value=\"SUBMIT\" ng-disabled=\"acMinForm.$invalid || minsubmitting\" class=\"btn btn-default\"/></div></form><div ng-if=\"report.subid\"><div role=\"alert\" class=\"alert alert-success\">Your report was successfully submited.</div><input type=\"button\" value=\"Back\" ng-click=\"goBack()\" class=\"btn btn-default\"/><div class=\"well\"><H4>Share this report:</H4><ul class=\"list-inline\"><li><a ng-href=\"https://twitter.com/intent/tweet?status={{::report.shareUrl}}\"><i class=\"fa fa-twitter fa-fw fa-lg\"></i></a></li><li><a ng-href=\"https://www.facebook.com/sharer/sharer.php?u={{::report.shareUrl}}\"><i class=\"fa fa-facebook fa-fw fa-lg\"></i></a></li><li><a ng-href=\"https://plus.google.com/share?url={{::report.shareUrl}}\"><i class=\"fa fa-google-plus fa-fw fa-lg\"></i></a></li></ul></div></div><div ng-if=\"minerror\"><div role=\"alert\" class=\"alert alert-danger\"><p>There was an error submittting you report.</p><p ng-if=\"minerrormsg\">{{minerrormsg}}</p><div ng-if=\"validationErrors\">Please checkout the following fields:<p ng-repeat=\"(tab, fields) in validationErrors\"><span class=\"firstCapital\">{{::tab}} - {{::fields}}</span></p></div></div></div></div>");
$templateCache.put("min-report-form2.html","<div class=\"min-form\"><form name=\"acMinForm\" ng-submit=\"submitForm()\" ng-show=\"!report.subid &amp;&amp; !minerror\" role=\"form\"><div ng-class=\"{\'has-error\': !acMinForm.title.$valid}\" class=\"form-group\"><label for=\"title\"><i class=\"fa fa-newspaper-o\"></i>Report title</label><input type=\"text\" name=\"title\" ng-model=\"report.title\" required=\"required\" class=\"form-control\"/></div><div ng-class=\"{\'has-error\': !acMinForm.datetime.$valid}\" class=\"form-group\"><label for=\"datetime\"><i class=\"fa fa-clock-o\"></i>Date and Time</label><input type=\"datetime\" name=\"datetime\" ng-model=\"report.datetime\" ac-datetime-picker=\"ac-datetime-picker\" class=\"form-control\"/></div><div ng-class=\"{\'has-error\': !acMinForm.latlng.$valid}\" class=\"form-group\"><label for=\"latlng\"><i class=\"fa fa-map-marker\"></i>Location</label><div ac-location-select=\"ac-location-select\" latlng=\"report.latlng\" style=\"height: 300px; width: 100%; margin: 10px 0;\"></div><input type=\"text\" name=\"latlng\" ng-model=\"report.latlng\" placeholder=\"Drop pin on map to set location\" required=\"required\" class=\"form-control\"/></div><div class=\"form-group\"><label for=\"uploads\"><i class=\"fa fa-image\"></i>Add photo<small style=\"font-weight: normal;\"> .jpg or .png</small></label><input type=\"file\" name=\"uploads\" file-model=\"report.files\" accept=\".png,.jpg,.jpeg\" multiple=\"multiple\" class=\"form-control\"/><div>{{ report.files.length }} photos added</div></div><div class=\"panel-group\"><div class=\"panel panel-default\"><div style=\"background-color: black; color: white;\" class=\"panel-heading\"><h4 class=\"panel-title\">Avalanche Report</h4></div><div class=\"panel-body\"><div class=\"panel-group\"><div ng-repeat=\"(item, av) in report.obs.avalancheReport\" class=\"panel panel-default\"><div class=\"panel-heading\"><h4 class=\"panel-title\"><strong>{{ av.prompt }}</strong></h4></div><div class=\"panel-body\"><div class=\"form-group\"></div><div ng-if=\"av.type==\'checkbox\'\" ng-repeat=\"(option, enabled) in av.options\" class=\"checkbox\">{{option}}<label><input type=\"checkbox\" ng-model=\"report.avs[item].options[option]\"/>{{option}}</label></div><div ng-if=\"av.type==\'single\'\" ng-repeat=\"option in av.options\" class=\"radio\"><label><input type=\"radio\" ng-model=\"report.avs[item].selected\" ng-value=\"option\"/>{{option}}</label></div></div></div></div></div></div></div><div class=\"panel-group\"><div class=\"panel panel-default\"><div style=\"background-color: black; color: white;\" class=\"panel-heading\"><h4 class=\"panel-title\">Riding\nconditions</h4></div><div class=\"panel-body\"><div class=\"panel-group\"><div ng-repeat=\"(item, ridingCondition) in report.obs.quickReport.ridingConditions\" class=\"panel panel-default\"><div class=\"panel-heading\"><h4 class=\"panel-title\"><strong>{{ ridingCondition.prompt }}</strong></h4></div><div class=\"panel-body\"><div class=\"form-group\"></div><div ng-if=\"ridingCondition.type==\'multiple\'\" ng-repeat=\"(option, enabled) in ridingCondition.options\" class=\"checkbox\"><label><input type=\"checkbox\" ng-model=\"report.obs.quickReport.ridingConditions[item].options[option]\"/>{{option}}</label></div><div ng-if=\"ridingCondition.type==\'single\'\" ng-repeat=\"option in ridingCondition.options\" class=\"radio\"><label><input type=\"radio\" ng-model=\"report.obs.quickReport.ridingConditions[item].selected\" ng-value=\"option\"/>{{option}}</label></div></div></div></div></div></div><div class=\"panel panel-default\"><div style=\"background-color: black; color: white;\" class=\"panel-heading\"><h4 class=\"panel-title\"><strong>Avalanche conditions</strong></h4></div><div class=\"panel-body\"><div class=\"form-group\"><div class=\"checkbox\"><label><input type=\"checkbox\" ng-model=\"report.obs.quickReport.avalancheConditions.slab\"/>Slab\navalanches today or yesterday.</label></div><div class=\"checkbox\"><label><input type=\"checkbox\" ng-model=\"report.obs.quickReport.avalancheConditions.sound\"/>Whumphing or\ndrum-like sounds or shooting cracks.</label></div><div class=\"checkbox\"><label><input type=\"checkbox\" ng-model=\"report.obs.quickReport.avalancheConditions.snow\"/>30cm\n+ of new snow, or significant drifitng, or rain in the last 48 hours.</label></div><div class=\"checkbox\"><label><input type=\"checkbox\" ng-model=\"report.obs.quickReport.avalancheConditions.temp\"/>Rapid\ntemperature rise to near zero degrees or wet surface snow.</label></div></div></div></div></div><div class=\"form-group\"><label>Comments</label><textarea rows=\"3\" ng-model=\"report.comment\" class=\"form-control\"></textarea></div><input id=\"submit\" type=\"submit\" value=\"Submit\" ng-disabled=\"minsubmitting\" style=\"border-radius:0; background-color: rgb(0, 86, 183); color: white;\" class=\"btn btn-default\"/><i ng-show=\"minsubmitting\" class=\"fa fa-fw fa-lg fa-spinner fa-spin\"></i></form><div ng-show=\"report.subid\"><div role=\"alert\" class=\"alert alert-success\">Your report was successfully submited.</div><div class=\"well\"><h4>Share this report:</h4><ul class=\"list-inline\"><li><a ng-href=\"https://twitter.com/intent/tweet?status={{report.shareUrl}}\"><i class=\"fa fa-twitter fa-fw fa-lg\"></i></a></li><li><a ng-href=\"https://www.facebook.com/sharer/sharer.php?u={{report.shareUrl}}\"><i class=\"fa fa-facebook fa-fw fa-lg\"></i></a></li><li><a ng-href=\"https://plus.google.com/share?url={{report.shareUrl}}\"><i class=\"fa fa-google-plus fa-fw fa-lg\"></i></a></li></ul></div></div><div ng-show=\"minerror\"><div role=\"alert\" class=\"alert alert-danger\"><p>There was an error submittting you report.</p><p>{{minerrormsg}}</p></div></div></div>");
$templateCache.put("min-report-modal.html","<div id=\"minForm\" role=\"dialog\" class=\"modal fade\"><div class=\"modal-dialog\"><div class=\"modal-content\"><div class=\"modal-header\"><button data-dismiss=\"modal\" class=\"close\"><span>close</span></button><h4 class=\"modal-title\">Mountain Information Network Report</h4></div><div class=\"modal-body\"><div ac-min-report-form=\"ac-min-report-form\"></div></div></div></div></div>");
$templateCache.put("min-report-popup-modal.html","<div id=\"mobileMapPopup\" role=\"dialog\" class=\"modal fade\"><div class=\"modal-dialog\"><div class=\"modal-content\"><div class=\"modal-body\"></div>                <a href=\"#\" data-dismiss=\"modal\" style=\"position: absolute; right: 10px; top: 10px;\" class=\"pull-right\"><i class=\"fa fa-close fa-lg\"></i></a></div></div></div>");
$templateCache.put("social-share.html","<div class=\"well\"><H4>Share this report:</H4><ul class=\"list-inline\"><li><a href=\"https://twitter.com/intent/tweet?url=http://avalanche.ca\"><i class=\"fa fa-twitter fa-fw fa-lg\"></i></a></li><li><a href=\"https://www.facebook.com/sharer/sharer.php?u=http://avalanche.ca\"><i class=\"fa fa-facebook fa-fw fa-lg\"></i></a></li><li><a href=\"https://plus.google.com/share?url=http://avalanche.ca\"><i class=\"fa fa-google-plus fa-fw fa-lg\"></i></a></li></ul></div>");}]);
}());