import Head from 'next/head';
import Layout, { siteTitle } from '../components/layout';
import utilStyles from '../styles/utils.module.css';

export default function Home() {
  return(
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <p>Hello 👋, I'm <strong>Esteban</strong>, I’m a software engineer located in Colombia.</p>
        <p>I'm 23 years old, a Ruby/Ruby on Rails lover; I like JavaScript as well but, Ruby is my main.</p>
        <p>I like reading a lot, playing some videogames and I also like watching some series and anime 📺.</p>
      </section>
    </Layout>
  );
}
