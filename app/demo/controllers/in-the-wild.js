myDemoApp.controller('InTheWildCtrl',['$scope', function($scope) {

    $scope.sites = [
        {
            url:'http://www.caremarkjobs.co.uk',
            img: 'caremarkjobs.png',
            text: 'Recruitment site for a small business'
        },
        {
            url: 'https://connectedcommunitycare.org',
            img: 'ccc.png',
            text: 'Statutory reports for social care in Australia',
            tags: ['Login Required']
        },
        {
            img: 'plait.png',
            text: 'Mobile care planning',
            tags: ['In development']
        }
    ];

}]);