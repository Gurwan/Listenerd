class UserParams {
    constructor(username,scale,gap){
        this.username = username;
        this.scale = scale || '/ 20';
        this.gap = gap || [
            [0, 10, 'red'],
            [10, 14, 'orange'],
            [14, 17, 'green'],
            [17, 20, 'gold']
        ];
    }
}

module.exports = UserParams ;
