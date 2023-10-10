# DevFest Registration System
A custom-built registration system for the upcoming GDG Davao DevFest 2023.

## Features
- Admin dashboard for managing registrants / participants
- Screen registrants ("approve" and "reject")
- Ability to add and pick event "bundles"
- Handle e-wallet payments data
- Create summaries similar to Google Forms
- Send custom e-mails
- Generate certificates

## Development
### Stack
- PocketBase
- ViteJS
- ReactJS
- TypeScript
- shadcn/ui and react-hook-forms

### Prerequisites
- [PocketBase](https://pocketbase.io) 0.18.5 and above
- NodeJS (Either latest or LTS)

### Installation / Setup
#### Backend
1. Download PocketBase, and follow the [setup instructions](https://pocketbase.io/docs/).
2. Back to your repo, run `npm install` and copy `.env.example` into `.env` file. Fill the `PB_PATH` with the location of your PocketBase instance.
   - > [!IMPORTANT] do not move .env.example!
3. On your PocketBase dashboard, go to `Settings > Backups`, click the little upload icon and select the `backup.zip` from the pb folder. Once loaded, click the Restore button.
4. Run `npm run pb-sync push`. This will sync the repo's `pb` folder to your PocketBase instance.
5. Restart/start PocketBase, go to [`http://localhost:8090/_`](http://localhost:8090/_) (observe the `_`), and login.
   - If not registered, use `example@example.com` and `1234567890` as e-mail and password when registering.

> [!NOTE]
> If you are uploading an updated version of `backup.zip`, be sure to delete the existing backup.zip entry by clicking the trash can icon.

#### Frontend
1. Open a terminal pointing to the repo directory and execute `npm install`
2. Afterwards, execute `npm run dev` to start the app. Open your browser and go to [`https://localhost:5173`](https://localhost:5173) to see the web app.

### Schema
![Schema](./pb/pb_diagram_simple.png)

DRS is composed of multiple tables (or PocketBase "collections"):

| Collection Name | Explanation | Relies on |
|-----------------|-------------|-----------|
| `addons` | List of available add-ons for the event. ||
| `form_details` | Metadata / information to be used for display on the registration forms. ||
| `merch_sensing_data` | Data related to merchandice sensing. | `registrations` |
| `payments` | Payment data of the registrants. | `registrations` |
| `professional_profiles` | Profile data of professional registrants. Only created if registrant is a `professional`. | `registrations` |
| `registrations` | A list of persons who registered for the event. ||
| `registration_statuses` | Registration statuses of the registrants if they are approved or rejected. | `registrations` |
| `student_profiles` | Profile data of student registrants. Only created if registrant is a `student`. | `registrations` |
| `ticket_types` | List of available ticket types. ||
| `topic_interests` | List of topics to be chosen by the registrant. | `registrations` |

### Form Rendering
For flexibility, form fields are not "hard-coded" into the frontend app but are instead rendered dynamically by relying on the information provided by the backend server through the `/api/registration-fields` endpoint. This endpoint is a JSON array containing information compiled from the `registrations` collection schema which will also query the `form_details` collection if present.

Once received, data is then fed into `FormFieldRenderer` component which will render the appropriate form input component based on the given field name and type. You may also provide and render custom form components by field. (See [TopicInterestFormRenderer](/src/components/form_renderers/TopicInterestFormRenderer.tsx))

## PocketBase Notes
### Custom backend API Endpoints
We utilize PocketBase's server hooks feature to create custom API endpoints similar to Firebase's custom functions.

Currently we only use it for getting registration fields list and registration slot counter. To add an endpoint, simply modify the `main.pb.js` inside `pb_hooks`. See PocketBase Server Hooks docs for details.

### Updating DB schema
When updating the database schema or related to PocketBase, be sure to update PB-related and `pb/pb_schema.json` files:
1. Run `npm run pb-sync pull`.
2. Update `pb_schema.json` by copying the JSON text in `Settings -> Export Collection` and paste it into `pb/pb_schema.json`.

## Deploying to Production
### Backend
#### Via Fly.io
A `fly.toml` file and a `Dockerfile` were already been setup for backend deployment. To deploy, be sure to do `npm run pb-sync push` first
and on your PocketBase folder execute `fly launch` and `fly deploy` afterwards.

#### Manually
When deploying to other hosting providers such as DigitalOcean, see [Going to Production](https://pocketbase.io/docs/going-to-production/) page of the PocketBase docs.

### Frontend
#### Via Vercel
A `vercel.json` has already been setup for this project. Simply run `vercel --prod` to deploy the app.

#### Manually
Deploying the frontend to other services may require you to build the app in advance. To build the app, you need to create a separate 
`.env.production` file first for production-related environment variables. The content is as follows:
```
VITE_APP_URL=<deployed pocketbase URL>
```
Once the file is created and saved, you may now execute `npm run build` and copy or reference the `dist` folder as the directory to
be uploaded to the desired hosting service.

## Resources
- [PocketBase Documentation](https://pocketbase.io/docs)
- [PocketBase JS Server Hooks Documentation](https://pocketbase.io/docs/js-overview/)
- [PocketBase JS Client Documentation](npmjs.com/package/pocketbase) (Can be also found on doc examples)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [react-hook-forms Documentation](https://www.react-hook-form.com/)
- [react-router Documentation](https://reactrouter.com/)

### Copyright (c) 2023 GDG DevFest Davao Team
