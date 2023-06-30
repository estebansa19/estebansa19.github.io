import Head from 'next/head';
import Link from 'next/link';
import Layout, { siteTitle } from '../components/layout';
import utilStyles from '../styles/utils.module.css';
import { getSortedPostsData } from '../lib/posts';
import Date from '../components/date';

export async function getStaticProps() {
  const allPostsData = getSortedPostsData();

  return {
    props: {
      allPostsData,
    }
  }
}

export default function Home({ allPostsData }) {
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
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Blog</h2>
        <ul className={utilStyles.list}>
          {
            allPostsData.map(({ id, date, title }) => (
              <li className={utilStyles.listItem} key={id}>
                <Link href={`/posts/${id}`}>{title}</Link>
                <br />
                <small className={utilStyles.lightText}>
                  <Date dateString={date}/>
                </small>
              </li>
            ))
          }
        </ul>
      </section>
    </Layout>
  );
}
