import { EyeInvisibleOutlined, EyeOutlined, LoadingOutlined } from '@yth/icons';
import styles from './index.module.less';
import { setToken, setUser } from 'ythUtils/common';

import CryptoJS from 'crypto-js';
import { userApi } from '@/services/user';

import { ChangeEvent, useState, FC, useRef, useEffect } from 'react';
import classNames from 'classnames';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';

const keyHex = CryptoJS.enc.Utf8.parse('ythCloudPlatform');

const encrypt = (str: string) => {
  const dataHex = CryptoJS.enc.Utf8.parse(str);
  const encrypted = CryptoJS.AES.encrypt(dataHex, keyHex, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.toString();
};

const timer: number | null = null;

interface IProps {
  getLogin?: () => void;
}

const Login: FC<IProps> = () => {
  const userRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  /**
   * 点击登录
   * @param val
   */
  const [loading, setLoading] = useState(false);
  const onFinish = async () => {
    // 登录回填用setState第一次不变更老是取不到值，所以更改为userRef方式取值
    // @ts-ignore
    const username = userRef.current.value;
    // @ts-ignore
    const password = passRef.current.value;
    if (username && password) {
      setLoading(true);
      const pass = encrypt(password);
      // autoLogin: true, 暂时写死后期再加
      const data = {
        username,
        password: pass,
        autoLogin: true,
        grantType: 'password',
        scope: 'server',
        type: 'account',
      };
      const res = window.isMobile ? await userApi.mobileLogin(data) : await userApi.pcLogin(data);
      setLoading(false);
      const resData: any = res;
      const errData = res;
      if (resData.status) {
        setToken(`${resData.token_type} ${resData.access_token}`);
        const resUser = await userApi.currentUser();
        const user = {
          ...resUser,
          username: resUser.userName,
          accountId: resUser.orgId,
          tenantId: '1',
        };
        setUser(user);
        navigate('/', { replace: true });
      } else {
        message.error(errData.msg);
      }
    } else {
      validateUserName(username);
      validatePass(password);
    }
    timer && clearTimeout(timer);
  };

  /**
   * 输入值用户名
   */
  const changeUser = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setUserErr('');
    }
  };
  /**
   * 验证用户名
   */
  const [userErr, setUserErr] = useState<string>();
  const validateUserName = (val?: string) => {
    if (val) {
      setUserErr('');
    } else {
      setUserErr('请输入用户名');
    }
  };

  /**
   * 输入密码
   */
  const changePassword = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setPassErr('');
    }
  };

  /**
   * 校验密码
   */
  const [passErr, setPassErr] = useState('');
  const validatePass = (val?: string) => {
    if (val) {
      setPassErr('');
    } else {
      setPassErr('请输入登录密码');
    }
  };

  /**
   * 点击眼睛
   */
  const [passType, setPassType] = useState('password');
  const clickEye = () => {
    passType === 'password' ? setPassType('text') : setPassType('password');
  };

  /**
   * 监听enter键
   */
  const clickEnter = (e: globalThis.KeyboardEvent) => {
    if (e.keyCode === 13) {
      onFinish();
    }
  };

  /**
   * 自动登录
   */
  const autoLogin = () => {
    userRef.current!.value = '';
    passRef.current!.value = '';
    onFinish();
  };
  useEffect(() => {
    autoLogin();
    window.addEventListener('keyup', clickEnter, false);
    return () => {
      window.removeEventListener('keyup', clickEnter, false);
    };
  }, []);

  return (
    <>
      <div className={styles['login-bg']} />
      <div className={styles['login-bg-color']} />
      <div className={styles.container}>
        {window.isMobile ? null : (
          <div
            className={styles['system-text']}
            style={{ display: 'grid', placeContent: 'center' }}
          >
            <p className={styles.company}>微模块登录</p>
          </div>
        )}
        <div className={styles.form}>
          <div className={styles['form-content']}>
            <h2 className={styles['form-text']}>账号登录</h2>
            <div style={{ height: '70px' }}>
              <input
                ref={userRef}
                placeholder="请输入工号"
                onChange={changeUser}
                className={classNames(styles.password, userErr ? styles['validate-err'] : '')}
              />
              {userErr && <div className={styles.tips}>{userErr}</div>}
            </div>
            <div style={{ marginTop: '13px' }}>
              <span
                className={classNames(styles.pass, 'flex-center')}
                style={{ display: 'block', height: '100%' }}
              >
                <input
                  ref={passRef}
                  placeholder="请输入登录密码"
                  onChange={changePassword}
                  className={classNames(styles.password, passErr ? styles['validate-err'] : '')}
                  type={passType}
                />
                <span
                  className={classNames(styles.eyes, passErr ? styles['validate-err'] : '')}
                  onClick={clickEye}
                >
                  {passType === 'password' ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                </span>
              </span>
              {passErr && <div className={styles.tips}>{passErr}</div>}
            </div>
            {loading ? (
              <div className={styles.button}>
                <LoadingOutlined />
              </div>
            ) : (
              <div onClick={onFinish} className={styles.button}>
                登录
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
export default Login;
