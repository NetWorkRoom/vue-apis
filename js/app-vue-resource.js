/* Создаем переменную local с url адресом для получения данных с сервера */
var local = 'http://localhost:3000/aphorisms/';

/* Создаем компонент aphorism и методы для него */
Vue.component('aphorism', {
    template: "#template-aphorisms",
    props: ['aphorism'],
    methods: {
        /* Метод позволяет удалять запись на странице
        и удалять ее же на сервере */
        deleteAphorism: function(aphorism) {
            /* Записываем в переменную index номер позиции выбранного для удаления объекта
            в массиве родительского компонента aphorisms */
            var index = this.$parent.aphorisms.indexOf(aphorism);
            /* Удаляем в родительского компонента в общем массиве записей aphorisms
            выбранный для удаления объект */
            this.$parent.aphorisms.splice(index, 1);
            /* Отправляем запрос на удаление выбранного объекта в базе данных на сервере */
            this.$http.delete(local + aphorism.id);
        },

        /* Метод позволяет увеличивать голос за кокретный афоризм на 1 и добавить данную
        информаци на сервере */
        upvoteAphorism: function(aphorism) {
            /* Увеличиваем значение свойства votes у выбранного афоризма на странице */
            aphorism.votes++;
            /* Заменяем на сервере запись на запись с новым значением голосовния в ней */
            this.$http.patch(local + aphorism.id, aphorism);
        },

        /* Метод позволяет добавляеть или установливать у кждой записи свойство editing
         с значением true */
        editAphorism: function (aphorism) {
            aphorism.editing = true;
        },

        /* Метод позволяет заменять существующую запись на сервере, на ее отредактированную версию */
        updateAphorism: function (aphorism) {
            /* Заменяем на сервере существующую запись на ее отредактированную версию */
            this.$http.patch(local + aphorism.id, aphorism);

            /* Устанавливаем значение false в свойство editing, чтобы показать снова
            кнопки возможных действий и скрыть поля ввода */
            aphorism.editing = false;
        },

        /* Метод служит для записи на сервер новых афоризмов и после этого выполняет обновления состояния страницы */
        saveAphorism: function (aphorism) {
            /* Отправляем на сервер новую запись для добвления в базу данных */
            this.$http.post(local, aphorism).then(function (response) {
                console.log(response.data.id);
                /* Обновляем идентификатор созданной записи полученый с сервера */
                Vue.set(aphorism, 'id', response.data.id);

                /* Устанавливаем значение false в свойство editing, чтобы показать снова
                кнопки возможных действий и скрыть поля ввода */
                aphorism.editing = false;
            });
        },

    },
});

/* Создаем новый объект Vue и записываем его в переменную vm */
new Vue({
    el: '#app',
    data: {
        aphorisms: [], // Массив для хранения всех записей
    },

    /* Вызываем при каждом монтировании в DOM родителького компонета метод fetchAphorisms() */
    mounted: function () {
        this.fetchAphorisms()
    },

    methods: {
        /* Метод служит для создания новых записей на странице */
        createAphorism: function () {
            /* Создается объект newAphorism с свойствами по умолчанию */
            var newAphorism = {
                text: '',
                votes: 0,
                editing: true
            };
            /* Новая запись добавляется в конец массива aphorisms, который содержит
            уже существующие записи */
            this.aphorisms.push(newAphorism);
        },

        /* Метод позволяет получить все записи с сервера по указанному адресу
        и записать их в массив aphorisms в объекте $data */
        fetchAphorisms: function () {

            /* Записываем в переменную vm ссылку на текущий объект */
            var vm = this;

            /* Отправляем запрос на сервер для получения всех записей в базе данных */
            this.$http.get(local)
                .then(function (response) {

                    /* Перебираем полученный массив с данными с сервера и добавляем каждому объекту
                    свойство editing со значением false, и записываем в переменную aphorismsReady */
                    var aphorismsReady = response.data.map(function (aphorism) {
                        aphorism.editing = false;
                        return aphorism
                    });

                    /* Записываем в свойство aphorisms в объект $data полученные с сервера
                    и обработанные данные */
                    Vue.set(vm, 'aphorisms', aphorismsReady)
                });
        },
    }
});
