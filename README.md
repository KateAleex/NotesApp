# Деловые Заметки

Мобильное приложение для создания, редактирования, удаления и поиска заметок. Разработано на React Native + Expo с поддержкой iOS, Android и Web.

## Возможности

- Создание, редактирование и удаление заметок
- Организация заметок по папкам
- Чек-листы внутри заметок (можно чередовать текст и чек-листы)
- Поиск заметок по ключевым словам и дате
- Два способа хранения данных: SQLite и файловая система
- Адаптивная тема (светлая / тёмная — подстраивается под систему)
- Кроссплатформенность: iOS, Android, Web

## Технологии

- **React Native** + **Expo SDK 54**
- **TypeScript**
- **Expo Router** — файловая навигация
- **expo-sqlite** — локальная база данных
- **expo-file-system** — файловое хранилище
- **@expo/vector-icons (Ionicons)** — иконки
- **EAS Build** — сборка APK/IPA в облаке

## Установка и запуск

### Предварительные требования

- [Node.js](https://nodejs.org/) v18 или новее
- npm (поставляется вместе с Node.js)
- [Expo Go](https://expo.dev/go) на мобильном устройстве (для тестирования на реальном телефоне)

### 1. Клонирование репозитория

```bash
git clone <URL_РЕПОЗИТОРИЯ>
cd NotesApp
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Запуск

#### Веб-версия (самый быстрый способ)

```bash
npx expo start --web
```

Откроется в браузере по адресу `http://localhost:8081`

#### iOS симулятор (требуется macOS + Xcode)

```bash
npx expo run:ios
```

При первом запуске автоматически создаст нативный проект и откроет iOS симулятор.

**Требования:**
- macOS
- Xcode (скачать из App Store)
- iOS Simulator (скачать через Xcode → Settings → Platforms)

#### Android эмулятор (требуется Android Studio)

```bash
npx expo run:android
```

**Требования:**
- [Android Studio](https://developer.android.com/studio)
- Android SDK (устанавливается через Android Studio)
- Созданный эмулятор (Android Studio → Device Manager → Create Device)
- Java JDK 17 (`brew install openjdk@17` на macOS)

Перед запуском убедитесь, что эмулятор запущен.

#### На реальном устройстве через Expo Go

```bash
npx expo start
```

Отсканируйте QR-код в приложении Expo Go (Android) или камерой (iOS).

> **Примечание:** устройство и компьютер должны быть в одной Wi-Fi сети.

## Сборка APK (Android)

### Облачная сборка (рекомендуется)

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

После завершения (~5-10 минут) получите ссылку на скачивание APK.

### Локальная сборка

```bash
cd android
./gradlew assembleRelease
```

APK будет в `android/app/build/outputs/apk/release/app-release.apk`

## Структура проекта

```
├── app/                    # Экраны (Expo Router)
│   ├── _layout.tsx         # Корневой layout, навигация
│   ├── index.tsx           # Главный экран — список папок
│   ├── folder/[id].tsx     # Список заметок в папке
│   ├── note/create.tsx     # Создание заметки
│   ├── note/[id].tsx       # Редактирование заметки
│   └── settings.tsx        # Настройки (выбор хранилища)
├── components/             # UI-компоненты
│   ├── BlockEditor.tsx     # Блочный редактор (текст + чек-листы)
│   ├── ChecklistEditor.tsx # Редактор чек-листа
│   ├── LinedPaper.tsx      # Линованная бумага (фон редактора)
│   ├── NoteCard.tsx        # Карточка заметки в списке
│   ├── SearchBar.tsx       # Поиск
│   └── theme.ts            # Цветовая схема (светлая/тёмная)
├── context/
│   └── NotesContext.tsx    # React Context — состояние приложения
├── services/               # Слой хранения данных
│   ├── storage.ts          # Фабрика хранилищ
│   ├── sqliteStorage.ts    # SQLite реализация
│   ├── fileStorage.ts      # Файловая реализация
│   └── webStorage.ts       # Web (localStorage) реализация
├── types/
│   └── index.ts            # TypeScript типы
├── assets/                 # Иконки и ресурсы
├── app.json                # Конфигурация Expo
├── eas.json                # Конфигурация EAS Build
└── package.json
```

## Хранение данных

Приложение поддерживает два способа хранения:

| Способ | Описание | Когда использовать |
|--------|----------|-------------------|
| **SQLite** | Локальная реляционная БД | По умолчанию. Быстрый поиск, подходит для большого количества заметок |
| **Файловая система** | Каждая заметка — отдельный JSON-файл | Удобно для резервного копирования и переноса данных |

Переключение между хранилищами: **Настройки → Хранилище данных**

## Лицензия

MIT
